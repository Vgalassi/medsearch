import { inject, injectable } from "inversify";
import { NotfoundError } from "../../domain/errors/NotFoundError";
import type { Doctor } from "../../domain/Aggregates/Doctor";
import type { DoctorRepository } from "../../domain/repositories/DoctorRepository";
import { TYPES } from "../dto/types";

@injectable()
export class GetDoctorByIdUseCase {
  constructor(
    @inject(TYPES.DoctorRepository)
    private readonly doctorRepository: DoctorRepository,
  ) {}

  async execute(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findById(id);
    if (!doctor) throw new NotfoundError("Doctor", id);
    return doctor;
  }
}
