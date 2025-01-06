import fs from "node:fs"

export default function parseCSVWithStream(filename: fs.PathLike): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const reader = fs.createReadStream(filename, {'encoding': "utf-8"})

    let rows: string[] = []

    reader.on("error", (err) => reject(err))
    reader.on("data", (data) => {
      const row = data.toString().trim()
      rows.push(row)
    })

    reader.on("end", () => {
      rows = rows.join("").split("\n")
      const result = rows.map((row) => row.split(","))
      resolve(result)
    })
  })
}

