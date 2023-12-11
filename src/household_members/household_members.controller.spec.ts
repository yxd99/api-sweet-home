import { Test, TestingModule } from '@nestjs/testing';
import { HouseholdMembersController } from './household_members.controller';
import { HouseholdMembersService } from './household_members.service';

describe('HouseholdMembersController', () => {
  let controller: HouseholdMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HouseholdMembersController],
      providers: [HouseholdMembersService],
    }).compile();

    controller = module.get<HouseholdMembersController>(HouseholdMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
