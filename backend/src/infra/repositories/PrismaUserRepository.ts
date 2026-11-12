import { injectable } from "inversify";
import { User } from "../../domain/Aggregates/User";
import { Doctor } from "../../domain/Aggregates/Doctor";
import { Patient } from "../../domain/Aggregates/Patient";
import { Clinic } from "../../domain/Aggregates/Clinic";
import { UserAlreadyExistsError } from "../../domain/errors/UserAlreadyExistsError";
import type { UserProfile, UserRepository } from "../../domain/repositories/UserRepository";
import type { Email } from "../../domain/value-objects/Email";
import { prisma } from "../../lib/prisma";
import type { Prisma } from "../generated/prisma/client";
import { UserMapper } from "../mappers/UserMapper";
import { PatientMapper } from "../mappers/PatientMapper";
import { ClinicMapper } from "../mappers/ClinicMapper";
import { DoctorMapper } from "../mappers/DoctorMapper";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function toNestedProfile(profile: UserProfile): Omit<Prisma.UserCreateInput, "id" | "email" | "password" | "role"> {
  if (profile instanceof Patient) {
    const { userId: _userId, ...patient } = PatientMapper.toPersistence(profile);
    return { patient: { create: patient } };
  }

  if (profile instanceof Clinic) {
    const { userId: _userId, ...clinic } = ClinicMapper.toPersistence(profile);
    return { clinic: { create: clinic } };
  }

  if (profile instanceof Doctor) {
    const { userId: _userId, settings, availabilities, ...doctor } =
      DoctorMapper.toPersistence(profile);

    const settingsCreate = settings
      ? (({ doctorId: _doctorId, ...rest }) => rest)(settings)
      : null;

    return {
      doctor: {
        create: {
          ...doctor,
          ...(settingsCreate ? { settings: { create: settingsCreate } } : {}),
          ...(availabilities?.length
            ? {
                availabilities: {
                  create: availabilities.map(({ doctorId: _doctorId, ...availability }) => availability),
                },
              }
            : {}),
        },
      },
    };
  }

  throw new Error("Unsupported user profile");
}

@injectable()
export class PrismaUserRepository implements UserRepository {
  async saveWithProfile(user: User, profile: UserProfile): Promise<User> {
    const userData = UserMapper.toPersistence(user);

    try {
      const createdUser = await prisma.user.create({
        data: { ...userData, ...toNestedProfile(profile) },
      });

      return UserMapper.toDomain(createdUser as never);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new UserAlreadyExistsError();
      }
      throw error;
    }
  }

  async save(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);

    const createdUser = await prisma.user.create({
      data,
    });

    return UserMapper.toDomain(createdUser as never);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const foundUser = await prisma.user.findUnique({
      where: { email: email.email },
    });

    if (!foundUser) {
      return null;
    }

    return UserMapper.toDomain(foundUser as never);
  }

  async findById(id: string): Promise<User | null> {
    const foundUser = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!foundUser) {
      return null;
    }

    return UserMapper.toDomain(foundUser as never);
  }
}
