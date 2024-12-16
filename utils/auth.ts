interface PhoneValidationResult {
  isValid: boolean
  message: string
}

export function phoneIsValid(number: string): PhoneValidationResult {
  if (number.length && !number.match(/^08\d{10,14}$/)) {
    const errorMessage = "nomor harus diawali dengan 08 dan memiliki panjang 10-14 digit."
    return { isValid: false, message: errorMessage }
  }

  return { isValid: true, message: "nomor valid" }
}
