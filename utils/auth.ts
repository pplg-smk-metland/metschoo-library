import type { PhoneValidationResult } from "~/types"

export function phoneIsValid(number: string): PhoneValidationResult {
  if (!number.length) {
    return {
      isValid: false,
      message: "nomor kosong",
    }
  }

  if (!number.match(/^08\d{10,14}$/)) {
    const errorMessage = "nomor harus diawali dengan 08 dan memiliki panjang 10-14 digit."
    return { isValid: false, message: errorMessage }
  }

  return { isValid: true, message: "nomor valid" }
}
