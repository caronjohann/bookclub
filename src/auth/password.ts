import { hash, verify } from '@node-rs/argon2'

export const hashPassword = async (password: string): Promise<string> => {
  return await hash(password, {
    algorithm: 2,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  })
}

export const verifyPassword = async (password: string, passwordHash: string): Promise<boolean> => {
  return await verify(passwordHash, password)
}
