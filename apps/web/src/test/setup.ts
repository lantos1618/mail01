import { expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

// Mock environment variables
process.env.GMAIL_APP_PASSWORD = 'test-app-password'