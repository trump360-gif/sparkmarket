import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ModerationResult {
  needsReview: boolean;
  reasons: string[];
}

export interface BannedWordDto {
  word: string;
  category: string;
}

export interface SuspiciousWordDto {
  word: string;
  category: string;
}

// 금지어 카테고리
export const BANNED_WORD_CATEGORIES = {
  ILLEGAL: '불법 물품',
  ADULT: '성인/음란물',
  WEAPON: '무기류',
  PERSONAL_INFO: '개인정보/사기',
  ILLEGAL_SERVICE: '불법 서비스',
  MEDICINE: '의약품',
} as const;

// 의심 키워드 카테고리
export const SUSPICIOUS_WORD_CATEGORIES = {
  URGENT_SALE: '급매/급처',
  PAYMENT: '결제 관련',
  CONTACT: '연락처 유도',
  CLAIM: '과장 주장',
} as const;

// 기본 금지어 목록 (초기 시드용)
const DEFAULT_BANNED_WORDS: BannedWordDto[] = [
  // 불법 물품
  { word: '마약', category: 'ILLEGAL' },
  { word: '대마', category: 'ILLEGAL' },
  { word: '필로폰', category: 'ILLEGAL' },
  { word: '코카인', category: 'ILLEGAL' },
  { word: '엑스터시', category: 'ILLEGAL' },
  { word: 'LSD', category: 'ILLEGAL' },
  { word: '대포폰', category: 'ILLEGAL' },
  { word: '대포통장', category: 'ILLEGAL' },
  { word: '위조', category: 'ILLEGAL' },
  { word: '가짜', category: 'ILLEGAL' },
  { word: '짝퉁', category: 'ILLEGAL' },
  { word: '레플리카', category: 'ILLEGAL' },
  { word: '이미테이션', category: 'ILLEGAL' },
  // 성인/음란물
  { word: '성인용품', category: 'ADULT' },
  { word: '야동', category: 'ADULT' },
  { word: '포르노', category: 'ADULT' },
  { word: '성매매', category: 'ADULT' },
  { word: '원조교제', category: 'ADULT' },
  { word: '조건만남', category: 'ADULT' },
  // 무기류
  { word: '총기', category: 'WEAPON' },
  { word: '권총', category: 'WEAPON' },
  { word: '소총', category: 'WEAPON' },
  { word: '실탄', category: 'WEAPON' },
  { word: '도검', category: 'WEAPON' },
  // 개인정보/사기
  { word: '주민등록증', category: 'PERSONAL_INFO' },
  { word: '여권', category: 'PERSONAL_INFO' },
  { word: '신분증', category: 'PERSONAL_INFO' },
  { word: '학생증', category: 'PERSONAL_INFO' },
  { word: '운전면허증', category: 'PERSONAL_INFO' },
  { word: '계정판매', category: 'PERSONAL_INFO' },
  { word: '계정거래', category: 'PERSONAL_INFO' },
  { word: '아이디판매', category: 'PERSONAL_INFO' },
  { word: '비밀번호', category: 'PERSONAL_INFO' },
  // 불법 서비스
  { word: '해킹', category: 'ILLEGAL_SERVICE' },
  { word: '도박', category: 'ILLEGAL_SERVICE' },
  { word: '사채', category: 'ILLEGAL_SERVICE' },
  { word: '고리대금', category: 'ILLEGAL_SERVICE' },
  // 의약품
  { word: '처방전없이', category: 'MEDICINE' },
  { word: '수면제', category: 'MEDICINE' },
  { word: '마취제', category: 'MEDICINE' },
  { word: '스테로이드', category: 'MEDICINE' },
];

// 기본 의심 키워드 목록
const DEFAULT_SUSPICIOUS_WORDS: SuspiciousWordDto[] = [
  { word: '급처', category: 'URGENT_SALE' },
  { word: '급매', category: 'URGENT_SALE' },
  { word: '떨이', category: 'URGENT_SALE' },
  { word: '최저가', category: 'URGENT_SALE' },
  { word: '파격', category: 'URGENT_SALE' },
  { word: '공짜', category: 'URGENT_SALE' },
  { word: '선입금', category: 'PAYMENT' },
  { word: '현금전용', category: 'PAYMENT' },
  { word: '현금만', category: 'PAYMENT' },
  { word: '계좌이체만', category: 'PAYMENT' },
  { word: '연락처', category: 'CONTACT' },
  { word: '카톡', category: 'CONTACT' },
  { word: '텔레그램', category: 'CONTACT' },
  { word: '시그널', category: 'CONTACT' },
  { word: '미개봉', category: 'CLAIM' },
  { word: '새제품', category: 'CLAIM' },
  { word: '정품', category: 'CLAIM' },
  { word: '100%', category: 'CLAIM' },
];

@Injectable()
export class ModerationService implements OnModuleInit {
  // 캐시된 금지어/의심 키워드 목록
  private bannedWords: string[] = [];
  private suspiciousWords: string[] = [];

  // 가격 이상 탐지 기준 (카테고리별 최대 가격)
  private readonly maxPriceByCategory: Record<string, number> = {
    '디지털/가전': 10000000,
    '패션의류': 5000000,
    '패션잡화': 10000000,
    '뷰티/미용': 1000000,
    '스포츠/레저': 5000000,
    '생활/가공식품': 500000,
    '도서': 500000,
    '가구/인테리어': 10000000,
    '반려동물용품': 1000000,
    '기타': 5000000,
  };

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // 앱 시작 시 DB에서 금지어/의심 키워드 로드
    await this.seedDefaultWords();
    await this.refreshCache();
  }

  /**
   * 기본 금지어/의심 키워드 시드
   */
  private async seedDefaultWords() {
    // 금지어가 비어있으면 기본값 추가
    const bannedCount = await this.prisma.bannedWord.count();
    if (bannedCount === 0) {
      for (const word of DEFAULT_BANNED_WORDS) {
        await this.prisma.bannedWord.create({
          data: {
            word: word.word,
            category: word.category,
          },
        }).catch(() => {
          // 중복 무시
        });
      }
    }

    // 의심 키워드가 비어있으면 기본값 추가
    const suspiciousCount = await this.prisma.suspiciousWord.count();
    if (suspiciousCount === 0) {
      for (const word of DEFAULT_SUSPICIOUS_WORDS) {
        await this.prisma.suspiciousWord.create({
          data: {
            word: word.word,
            category: word.category,
          },
        }).catch(() => {
          // 중복 무시
        });
      }
    }
  }

  /**
   * 캐시 새로고침
   */
  async refreshCache() {
    const bannedWords = await this.prisma.bannedWord.findMany();
    const suspiciousWords = await this.prisma.suspiciousWord.findMany();

    this.bannedWords = bannedWords.map(w => w.word.toLowerCase());
    this.suspiciousWords = suspiciousWords.map(w => w.word.toLowerCase());
  }

  /**
   * 상품 콘텐츠 검토
   */
  checkContent(title: string, description: string, price: number, category: string): ModerationResult {
    const reasons: string[] = [];
    const textToCheck = `${title} ${description}`.toLowerCase();

    // 1. 금지어 검사
    const foundBannedWords = this.bannedWords.filter(word =>
      textToCheck.includes(word)
    );

    if (foundBannedWords.length > 0) {
      reasons.push(`금지어 포함: ${foundBannedWords.join(', ')}`);
    }

    // 2. 의심 키워드 검사 (3개 이상이면 검토 필요)
    const foundSuspiciousWords = this.suspiciousWords.filter(word =>
      textToCheck.includes(word)
    );

    if (foundSuspiciousWords.length >= 3) {
      reasons.push(`의심 키워드 다수 포함: ${foundSuspiciousWords.join(', ')}`);
    }

    // 3. 가격 이상 탐지
    const maxPrice = this.maxPriceByCategory[category] || 5000000;
    if (price > maxPrice) {
      reasons.push(`카테고리 최대 가격 초과 (${category}: ${maxPrice.toLocaleString()}원)`);
    }

    // 4. 너무 저렴한 가격 (100원 미만)
    if (price < 100) {
      reasons.push('가격이 비정상적으로 낮음');
    }

    // 5. 제목/설명이 너무 짧음
    if (title.length < 5) {
      reasons.push('제목이 너무 짧음 (5자 미만)');
    }

    if (description.length < 10) {
      reasons.push('설명이 너무 짧음 (10자 미만)');
    }

    // 6. 연락처 패턴 검사 (전화번호, 카카오톡 ID 등)
    const phonePattern = /01[0-9]-?\d{3,4}-?\d{4}/;
    const kakaoPattern = /카카오(톡)?[\s:]*[a-zA-Z0-9_]+/i;

    if (phonePattern.test(textToCheck)) {
      reasons.push('전화번호 포함 의심');
    }

    if (kakaoPattern.test(textToCheck)) {
      reasons.push('외부 연락처(카카오톡) 포함 의심');
    }

    return {
      needsReview: reasons.length > 0,
      reasons,
    };
  }

  // ============= 금지어 CRUD =============

  /**
   * 금지어 목록 조회
   */
  async getBannedWords(category?: string) {
    const where = category ? { category } : {};
    return this.prisma.bannedWord.findMany({
      where,
      orderBy: [{ category: 'asc' }, { word: 'asc' }],
    });
  }

  /**
   * 금지어 추가
   */
  async addBannedWord(word: string, category: string, createdBy?: string) {
    const result = await this.prisma.bannedWord.create({
      data: {
        word: word.trim(),
        category,
        created_by: createdBy,
      },
    });
    await this.refreshCache();
    return result;
  }

  /**
   * 금지어 삭제
   */
  async deleteBannedWord(id: string) {
    const result = await this.prisma.bannedWord.delete({
      where: { id },
    });
    await this.refreshCache();
    return result;
  }

  /**
   * 금지어 일괄 추가
   */
  async addBannedWords(words: BannedWordDto[], createdBy?: string) {
    const results: Awaited<ReturnType<typeof this.prisma.bannedWord.create>>[] = [];
    for (const { word, category } of words) {
      try {
        const result = await this.prisma.bannedWord.create({
          data: {
            word: word.trim(),
            category,
            created_by: createdBy,
          },
        });
        results.push(result);
      } catch {
        // 중복 무시
      }
    }
    await this.refreshCache();
    return results;
  }

  // ============= 의심 키워드 CRUD =============

  /**
   * 의심 키워드 목록 조회
   */
  async getSuspiciousWords(category?: string) {
    const where = category ? { category } : {};
    return this.prisma.suspiciousWord.findMany({
      where,
      orderBy: [{ category: 'asc' }, { word: 'asc' }],
    });
  }

  /**
   * 의심 키워드 추가
   */
  async addSuspiciousWord(word: string, category: string, createdBy?: string) {
    const result = await this.prisma.suspiciousWord.create({
      data: {
        word: word.trim(),
        category,
        created_by: createdBy,
      },
    });
    await this.refreshCache();
    return result;
  }

  /**
   * 의심 키워드 삭제
   */
  async deleteSuspiciousWord(id: string) {
    const result = await this.prisma.suspiciousWord.delete({
      where: { id },
    });
    await this.refreshCache();
    return result;
  }

  /**
   * 의심 키워드 일괄 추가
   */
  async addSuspiciousWords(words: SuspiciousWordDto[], createdBy?: string) {
    const results: Awaited<ReturnType<typeof this.prisma.suspiciousWord.create>>[] = [];
    for (const { word, category } of words) {
      try {
        const result = await this.prisma.suspiciousWord.create({
          data: {
            word: word.trim(),
            category,
            created_by: createdBy,
          },
        });
        results.push(result);
      } catch {
        // 중복 무시
      }
    }
    await this.refreshCache();
    return results;
  }

  /**
   * 카테고리 목록 조회
   */
  getCategories() {
    return {
      bannedWordCategories: BANNED_WORD_CATEGORIES,
      suspiciousWordCategories: SUSPICIOUS_WORD_CATEGORIES,
    };
  }
}
