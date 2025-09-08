import { expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

// Mock environment variables
process.env.SENDGRID_API_KEY = 'test-api-key'