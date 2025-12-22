import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { DaftarDto } from './dto/daftar.dto';
import { LoginDto } from './dto/login.dto';
import { LupaPasswordDto } from './dto/lupa-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Auth Controller
 *
 * OOP Concepts:
 * - Encapsulation: HTTP request handling dalam satu class
 * - Single Responsibility: Hanya handle HTTP requests untuk auth
 * - Dependency Injection: Inject AuthService
 *
 * Design Pattern:
 * - Controller Pattern: Handle HTTP requests dan responses
 * - Delegation Pattern: Delegate business logic ke AuthService
 *
 * Based on:
 * - Sequence-Register-SIMPLIFIED.puml
 * - Sequence-Login.puml
 * - Sequence-Email-Verification-SIMPLIFIED.puml
 * - Sequence-Auth-Forgot-Password.puml
 *
 * Endpoints:
 * - POST /api/auth/daftar - Register pengguna baru
 * - POST /api/auth/login - Login pengguna
 * - GET /api/auth/verifikasi-email/:userId/:token - Verifikasi email
 * - POST /api/auth/lupa-password - Request reset password
 * - POST /api/auth/reset-password/:token - Reset password
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/daftar
   *
   * Register pengguna baru
   *
   * @param daftarDto - Data pendaftaran (email, password, nama, nomorTelepon)
   * @returns User baru dan token verifikasi (development only)
   */
  @Post('daftar')
  @HttpCode(HttpStatus.CREATED)
  async daftar(@Body() daftarDto: DaftarDto) {
    return this.authService.daftarPengguna(daftarDto);
  }

  /**
   * POST /api/auth/login
   *
   * Login pengguna
   *
   * @param loginDto - Data login (email, password)
   * @returns JWT access token dan user data
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.loginPengguna(loginDto);
  }

  /**
   * GET /api/auth/verifikasi-email/:userId/:token
   *
   * Verifikasi email dengan token dari Redis
   *
   * @param userId - ID user yang akan diverifikasi
   * @param token - Token verifikasi (6 digit)
   * @returns Success message
   */
  @Get('verifikasi-email/:userId/:token')
  @HttpCode(HttpStatus.OK)
  async verifikasiEmail(
    @Param('userId') userId: string,
    @Param('token') token: string,
  ) {
    return this.authService.verifikasiEmail(userId, token);
  }

  /**
   * POST /api/auth/lupa-password
   *
   * Request reset password (kirim email dengan link reset)
   *
   * @param lupaPasswordDto - Email user
   * @returns Success message
   */
  @Post('lupa-password')
  @HttpCode(HttpStatus.OK)
  async lupaPassword(@Body() lupaPasswordDto: LupaPasswordDto) {
    return this.authService.kirimTokenResetPassword(lupaPasswordDto);
  }

  /**
   * POST /api/auth/reset-password/:token
   *
   * Reset password dengan token
   *
   * @param token - Token reset password dari email
   * @param resetPasswordDto - Password baru
   * @returns Success message
   */
  @Post('reset-password/:token')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(token, resetPasswordDto);
  }

  /**
   * Test JWT Authentication (Protected Route)
   *
   * GET /api/auth/test-jwt
   *
   * Endpoint untuk test apakah JWT authentication bekerja.
   * Harus login dulu dan kirim token di Authorization header.
   */
  @Get('test-jwt')
  @UseGuards(JwtAuthGuard)
  testJwt(@Request() req) {
    return {
      message: 'JWT Authentication berhasil!',
      user: req.user,
    };
  }
}
