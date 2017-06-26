# molten-databases
Specification and test generator for the MoltenDB database interfaces.

## Example implementation test file
```typescript
import createAwesomeInstance from '../';
import makeStorageTests from 'molten-storage';

describe('Awesome MoltenDB storage implementation', () => {
  beforeEach(() => {
    // Set up the database instance for the tests
  });

  afterEach(() => {
    // Destroy the database instance
  });

  makeStorageTests(createAwesomeInstance, {
    badOptions: [
      {
        label: 'with a bad baseFolder',
        options: {
          baseFolder: 'testfile'
        }
      },
      {
        label: 'with undefined options'
      },
    ],
    testOptions: {
      baseFolder: 'test'
    }
  });
});
```
