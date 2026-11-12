import { User } from "../Aggregates/User"
import type { Doctor } from "../Aggregates/Doctor"
import type { Patient } from "../Aggregates/Patient"
import type { Clinic } from "../Aggregates/Clinic"
import type { Email } from "../value-objects/Email"

export type UserProfile = Doctor | Patient | Clinic

export interface UserRepository {
    save(user: User): Promise<User>
    saveWithProfile(user: User, profile: UserProfile): Promise<User>
    findByEmail(email: Email): Promise<User | null>
    findById(id: string): Promise<User | null >
}
