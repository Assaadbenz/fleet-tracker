import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email address already exists');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Atomically create Tenant and Initial ADMIN user
    const { tenant, user } = await this.prisma.$transaction(async (tx) => {
      const createdTenant = await tx.tenant.create({
        data: {
          name: dto.companyName,
        },
      });

      const createdUser = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          role: UserRole.ADMIN,
          tenantId: createdTenant.id,
        },
      });

      return { tenant: createdTenant, user: createdUser };
    });

    const accessToken = await this.generateToken(user.id, user.email, tenant.id, user.role);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.generateToken(
      user.id,
      user.email,
      user.tenantId,
      user.role,
    );

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
      },
    };
  }

  async getProfile(userId: string, tenantId: string): Promise<AuthResponseDto['user'] & { tenantName: string }> {
    // Strictly scoped query by both userId AND tenantId
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User profile not found within tenant scope');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenantName: user.tenant.name,
    };
  }

  private async generateToken(
    userId: string,
    email: string,
    tenantId: string,
    role: UserRole,
  ): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      tenantId,
      role,
    };

    return this.jwtService.signAsync(payload);
  }
}
