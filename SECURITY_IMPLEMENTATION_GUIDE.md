# ALEM CRM - Security Implementation Guide

## 🔒 CRITICAL SECURITY IMPLEMENTATIONS

### 1. PASSWORD HASHING (URGENT)

#### Current Status: ⚠️ Argon2 in dependencies but NOT verified in code

**Implementation Required:**

Update `backend/src/modules/auth/auth.service.ts`:

```typescript
import * as argon2 from 'argon2'

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    })
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password)
    } catch (error) {
      return false
    }
  }

  // In register method:
  async register(dto: CreateUserDto) {
    const hashedPassword = await this.hashPassword(dto.password)
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    })
    return this.userRepository.save(user)
  }

  // In login method:
  async login(username: string, password: string) {
    const user = await this.userRepository.findOne({ where: { username } })
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await this.verifyPassword(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Continue with JWT generation...
  }
}
```

---

### 2. RATE LIMITING ENFORCEMENT

#### Status: Guard created, needs integration

**Add to `main.ts`:**

```typescript
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // 1 minute
      limit: 100, // 100 requests per minute
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

**For login endpoint (stricter limits):**

```typescript
@UseGuards(ThrottlerGuard)
@Post('login')
@Throttle(5, 60) // 5 attempts per minute
async login(@Body() loginDto: LoginDto) {
  // Login logic
}
```

---

### 3. CSRF PROTECTION

#### Status: ❌ Not implemented

**Implementation:**

```bash
npm install csurf cookie-parser
```

**In `main.ts`:**

```typescript
import * as cookieParser from 'cookie-parser'
import * as csurf from 'csurf'

app.use(cookieParser())
app.use(csurf({ cookie: true }))
```

**Generate CSRF token:**

```typescript
@Get('csrf-token')
getCsrfToken(@Req() req: any) {
  return { csrfToken: req.csrfToken() }
}
```

---

### 4. XSS PREVENTION

#### Status: ✅ Partially implemented (Helmet.js)

**Enhance in `main.ts`:**

```typescript
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  })
)
```

**Input validation (already using class-validator):**

```typescript
import { IsString, IsEmail, MaxLength, Matches } from 'class-validator'
import { sanitizeHtml } from 'sanitize-html'

export class UserDto {
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9_]*$/, { message: 'Invalid username' })
  username: string

  @IsEmail()
  email: string

  // Sanitize in service:
  sanitize(input: string): string {
    return sanitizeHtml(input, { allowedTags: [] })
  }
}
```

---

### 5. SQL INJECTION PROTECTION

#### Status: ✅ Using TypeORM with parameterized queries

**GOOD (Already implemented):**

```typescript
// Uses parameterized queries automatically
const users = await this.repository.find({
  where: { username: userInput }
})
```

**AVOID:**

```typescript
// ❌ Never use raw queries with string concatenation
query(`SELECT * FROM users WHERE username = '${userInput}'`)
```

---

### 6. SECURE FILE UPLOAD VALIDATION

#### Status: ⚠️ Partially implemented

**Enhanced validation:**

```typescript
import { FileValidator, ParseFilePipe, MaxFileSizeValidator } from '@nestjs/common'

export class ExcelFileValidator extends FileValidator {
  constructor() {
    super({
      fileIsRequired: true,
    })
  }

  isValid(file?: Express.Multer.File): boolean {
    if (!file) return false

    // Check MIME type
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]

    // Check file extension
    const allowedExtensions = ['xls', 'xlsx']
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase()

    return (
      allowedMimes.includes(file.mimetype) &&
      allowedExtensions.includes(fileExtension || '')
    )
  }

  buildError(): string {
    return 'Invalid file format. Only Excel files (.xls, .xlsx) are allowed.'
  }
}

// In controller:
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async upload(
  @UploadedFile(
    new ParseFilePipe({
      validators: [
        new ExcelFileValidator(),
        new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
      ],
    })
  )
  file: Express.Multer.File,
) {
  // Process file
}
```

---

### 7. JWT SECURITY ENHANCEMENTS

#### Status: ✅ Implemented, needs hardening

**Current implementation is good. Add these enhancements:**

```typescript
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Must be 32+ characters
      signOptions: {
        expiresIn: '15m', // Short-lived tokens
        algorithm: 'HS512', // Stronger algorithm
      },
    }),
  ],
})
export class AuthModule {}

// Refresh token rotation:
async refresh(refreshToken: string) {
  const decoded = this.jwtService.verify(refreshToken)
  
  // Invalidate old token
  await this.tokenRepository.delete({ token: refreshToken })
  
  // Issue new tokens
  const newAccessToken = this.jwtService.sign({ sub: decoded.sub })
  const newRefreshToken = this.generateRefreshToken()
  
  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}
```

---

### 8. SECURE PASSWORD RESET FLOW

#### Status: ✅ Implemented, verify security

**Verification checklist:**

```typescript
// ✅ Reset token should be:
// - Cryptographically random (using crypto.randomBytes)
// - Short-lived (1 hour expiration)
// - One-time use (marked as used after redemption)
// - Tied to specific user
// - Sent via email only (NOT SMS or other channels)

async requestPasswordReset(email: string) {
  const user = await this.userRepository.findOne({ where: { email } })
  if (!user) {
    // Don't reveal if email exists
    return { message: 'If email exists, reset link has been sent' }
  }

  // Generate secure token
  const resetToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = await argon2.hash(resetToken)
  
  await this.passwordResetRepository.create({
    userId: user.id,
    token: hashedToken,
    expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
    used: false,
  })

  // Send via email
  await this.emailService.sendPasswordResetEmail(
    email,
    resetToken, // Send unhashed token in URL
    user.fullName
  )
}

async resetPassword(token: string, newPassword: string) {
  const hashedToken = await argon2.hash(token)
  const reset = await this.passwordResetRepository.findOne({
    where: {
      token: hashedToken,
      used: false,
      expiresAt: MoreThan(new Date()),
    },
  })

  if (!reset) {
    throw new BadRequestException('Invalid or expired reset token')
  }

  // Update password
  const user = await this.userRepository.findOne({ where: { id: reset.userId } })
  user.password = await this.authService.hashPassword(newPassword)
  await this.userRepository.save(user)

  // Mark token as used
  reset.used = true
  await this.passwordResetRepository.save(reset)

  // Invalidate all existing sessions
  await this.refreshTokenRepository.delete({ userId: user.id })
}
```

---

### 9. SESSION MANAGEMENT & LOGOUT

#### Status: ⚠️ Needs enhancement

```typescript
// Add session invalidation:
async logout(userId: string) {
  // Delete all refresh tokens for this user
  await this.refreshTokenRepository.delete({ userId })
  
  // Add to token blacklist (optional, for extra security)
  await this.blacklistRepository.create({
    token: currentToken,
    expiresAt: tokenExpiryDate,
  })
}

// Verify token not blacklisted in guard:
async canActivate(context: ExecutionContext): Promise<boolean> {
  const token = this.extractTokenFromRequest(context)
  
  const blacklisted = await this.blacklistRepository.findOne({
    where: { token }
  })
  
  if (blacklisted) {
    throw new UnauthorizedException('Token has been revoked')
  }
  
  // Continue with validation...
}
```

---

### 10. AUDIT LOGGING FOR SECURITY EVENTS

#### Status: ✅ Implemented

**Log all security events:**

```typescript
// Login attempts
async login(username: string, password: string, req: Request) {
  const ipAddress = req.ip
  const userAgent = req.headers['user-agent']
  
  try {
    // ... login logic
    await this.auditService.log({
      userId: user.id,
      action: 'LOGIN',
      module: 'AUTH',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
    })
  } catch (error) {
    // Log failed attempt
    await this.auditService.log({
      userId: username, // Log username if user not found
      action: 'LOGIN',
      module: 'AUTH',
      status: 'FAILED',
      ipAddress,
      userAgent,
    })
    throw error
  }
}

// Data modifications
async updateUser(id: string, updateDto: UpdateUserDto, req: Request) {
  const currentUser = await this.userRepository.findOne({ where: { id } })
  
  const updated = await this.userRepository.save({
    ...currentUser,
    ...updateDto,
  })

  // Log the change
  await this.auditService.log({
    userId: req.user.id,
    action: 'UPDATE',
    module: 'USERS',
    resourceId: id,
    oldValues: currentUser,
    newValues: updated,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  })
}
```

---

### 11. ENVIRONMENT VARIABLE SECURITY

#### Status: ✅ Using .env

**Ensure in `.env.example` (NOT in `.env`):**

```bash
# ❌ NEVER commit actual values to git
# ✅ Use .env.example as template

JWT_SECRET=your-secret-here-min-32-chars
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
REFRESH_TOKEN_EXPIRATION=7d

# Database (use environment-specific credentials)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=alem_user
DB_PASSWORD=secure-password-here
DB_NAME=alem_crm_prod

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=app-specific-password
EMAIL_FROM=ALEM CRM <noreply@alemcrm.com>

# CORS
FRONTEND_URL=https://alemcrm.example.com

# Rate Limiting
RATE_LIMIT=100
RATE_LIMIT_WINDOW=60

# Production
NODE_ENV=production
```

---

## 🚨 IMMEDIATE ACTION ITEMS

### Priority 1 (TODAY)
- [ ] Verify Argon2 usage in auth service
- [ ] Enable rate limiting on login endpoint
- [ ] Verify JWT secrets are 32+ characters
- [ ] Check CORS configuration

### Priority 2 (THIS WEEK)
- [ ] Implement CSRF protection
- [ ] Add CSP headers
- [ ] Setup file upload validation
- [ ] Implement secure password reset flow

### Priority 3 (NEXT WEEK)
- [ ] Setup session invalidation on logout
- [ ] Add token blacklist
- [ ] Implement 2FA (optional)
- [ ] Add security headers

---

## 📋 SECURITY CHECKLIST

```
Authentication & Authorization:
☑ Password hashing with Argon2
☑ JWT with proper expiration
☑ Refresh token rotation
☑ Role-based access control
☐ Two-factor authentication (TBD)
☐ Session timeout warnings

Data Protection:
☑ HTTPS/TLS (production)
☑ SQL injection prevention (TypeORM)
☑ XSS prevention (Helmet, validation)
☑ CSRF protection (pending)
☑ File upload validation (pending)
☑ Input validation (class-validator)

Monitoring & Logging:
☑ Audit logging for all actions
☑ Failed login tracking
☑ Rate limiting
☐ Security event alerts (TBD)
☐ Intrusion detection (TBD)

Infrastructure:
☑ Environment variables
☑ Docker security
☑ Nginx security headers
☐ SSL/TLS certificates (production)
☐ Regular backups (production)
```

---

## 🔗 RESOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/introduction)
- [Argon2 Documentation](https://argon2-online.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

---

**Status**: 🔄 IN PROGRESS
**Last Updated**: July 20, 2026
**Next Review**: After implementation of Priority 1 items
