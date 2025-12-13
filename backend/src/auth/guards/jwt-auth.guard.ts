import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // 인증 실패 시 UnauthorizedException을 명시적으로 던짐
    if (err || !user) {
      throw new UnauthorizedException('인증이 필요합니다');
    }
    return user;
  }
}
