import { AppDataSource } from '../data-source';
import { ChickenBreedSeeder } from './chicken-breed.seeder';

// Map seeder names to their classes
const seeders: Record<string, any> = {
  ChickenBreedSeeder,
};

const seederArg = process.argv[2];

AppDataSource.initialize()
  .then(async (dataSource) => {
    if (seederArg) {
      const seederClass = seeders[seederArg];
      if (!seederClass) {
        console.error(`Seeder "${seederArg}" not found.`);
        process.exit(1);
      }
      await seederClass.run(dataSource);
      console.log(`Seeder "${seederArg}" executed successfully.`);
    } else {
      for (const key of Object.keys(seeders)) {
        const seederClass = seeders[key];
        await seederClass.run(dataSource);
        console.log(`Seeder "${key}" executed successfully.`);
      }
    }

    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeder error:', err);
    process.exit(1);
  });

// Usage:
// npx ts-node -r tsconfig-paths/register src/seeds/seeders.ts
// npx ts-node -r tsconfig-paths/register src/seeds/seeders.ts ChickenBreedSeeder
