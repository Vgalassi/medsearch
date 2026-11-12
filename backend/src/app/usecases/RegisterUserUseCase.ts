import type { User } from "../../domain/Aggregates/User";
import type { UseCase } from "../../domain/value-objects/UseCase";
import type { RegisterUserDto } from "../dto/RegisterUserDto";
import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import type { UserProfile, UserRepository } from "../../domain/repositories/UserRepository";
import type { HashGenerator } from "../protocols/HashGenerator";
import { Identifier } from "../../domain/value-objects/Identifier";
import { User as UserAggregate } from "../../domain/Aggregates/User";
import { Doctor } from "../../domain/Aggregates/Doctor";
import { Patient } from "../../domain/Aggregates/Patient";
import { Clinic } from "../../domain/Aggregates/Clinic";
import { Email } from "../../domain/value-objects/Email";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber";
import { CPF } from "../../domain/value-objects/Cpf";
import { UserAlreadyExistsError } from "../../domain/errors/UserAlreadyExistsError";
import type { CepService } from "../protocols/CepService";
import type { GeocodingService } from "../protocols/GeocodingService";

@injectable()
export class RegisterUserUseCase implements UseCase<RegisterUserDto,Promise<User>>{
    constructor(
        @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
        @inject(TYPES.HashGenerator) private readonly hashGenerator: HashGenerator,
        @inject(TYPES.CepService) private readonly CepService: CepService,
        @inject(TYPES.GeocodingService) private readonly GeocodingService: GeocodingService
    ){}

    async execute(input: RegisterUserDto): Promise<User> {
        const email = new Email(input.email);
        const phone = new PhoneNumber(input.phone);
        const userAlreadyExists = await this.userRepository.findByEmail(email);
        if (userAlreadyExists) {
            throw new UserAlreadyExistsError();
        }

        const passwordHash = await this.hashGenerator.hash(input.password);
        const user = new UserAggregate(
            {
                email,
                password: passwordHash,
                role: input.role,
            },
            new Identifier(),
        );

        // Build and validate the profile before persisting anything; user and
        // profile are then saved atomically so a failure never leaves an orphan user.
        const profile = await this.buildProfile(input, user, phone);
        return this.userRepository.saveWithProfile(user, profile);
    }

    private async buildProfile(input: RegisterUserDto, user: User, phone: PhoneNumber): Promise<UserProfile> {
        if (input.role === "DOCTOR") {
            if (!input.crm || !input.speciality) {
                throw new Error("Doctor data is required");
            }

            return Doctor.create(
                {
                    userId: user.id,
                    name: input.name,
                    phone,
                    crm: input.crm,
                    speciality: input.speciality,
                    ...(input.clinicId ? { clinicId: new Identifier(input.clinicId) } : {}),
                    Availabilities: null,
                    schedulingSettings: null
                },
                new Identifier(),
            );
        }

        if (input.role === "PATIENT") {
            if (!input.cpf) {
                throw new Error("Patient data is required");
            }

            return new Patient(
                {
                    userId: user.id,
                    name: input.name,
                    phone,
                    cpf: new CPF(input.cpf)
                },
                new Identifier(),
            );
        }

        if (!input.cep  || !input.description || !input.number) {
            throw new Error("Clinic data is required");
        }

        let address = await this.CepService.findAddress(input.cep,input.number)
        address = await this.GeocodingService.getCoordinates(address)
        return new Clinic(
            {
                userId: user.id,
                name: input.name,
                phone,
                address: address,
                description: input.description,
            },
            new Identifier(),
        );
    }
}
