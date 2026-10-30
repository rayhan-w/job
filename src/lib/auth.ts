import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-super-secret-key-jobportal-2026";
const COOKIE_NAME = "jp_session";

export interface SessionPayload {
  userId: string;
  phone: string;
  role: string;
  name: string;
  impersonatorId?: string;
  impersonatorRole?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function hasPermission(userId: string, module: string, action: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      staffProfile: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true }
              }
            }
          }
        }
      }
    }
  });

  if (!user) return false;
  if (user.role === "SUPER_ADMIN") return true;

  if (user.role === "ADMIN_STAFF" && user.staffProfile?.role) {
    return user.staffProfile.role.permissions.some(
      (rp) => rp.permission.module === module && (rp.permission.action === action || rp.permission.action === "all")
    );
  }

  return false;
}
