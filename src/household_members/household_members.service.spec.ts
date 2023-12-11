import { Test, TestingModule } from '@nestjs/testing';
import { HouseholdMembersService } from './household_members.service';

describe('HouseholdMembersService', () => {
  let service: HouseholdMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HouseholdMembersService],
    }).compile();

    service = module.get<HouseholdMembersService>(HouseholdMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
