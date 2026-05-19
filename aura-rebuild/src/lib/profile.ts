export function zodiacFromBirthday(birthday: string): string {
  if (!birthday) return "";
  const [, monthRaw, dayRaw] = birthday.split("-");
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  const signs = [
    { name: "Capricorn", from: [1, 1], to: [1, 19] },
    { name: "Aquarius", from: [1, 20], to: [2, 18] },
    { name: "Pisces", from: [2, 19], to: [3, 20] },
    { name: "Aries", from: [3, 21], to: [4, 19] },
    { name: "Taurus", from: [4, 20], to: [5, 20] },
    { name: "Gemini", from: [5, 21], to: [6, 20] },
    { name: "Cancer", from: [6, 21], to: [7, 22] },
    { name: "Leo", from: [7, 23], to: [8, 22] },
    { name: "Virgo", from: [8, 23], to: [9, 22] },
    { name: "Libra", from: [9, 23], to: [10, 22] },
    { name: "Scorpio", from: [10, 23], to: [11, 21] },
    { name: "Sagittarius", from: [11, 22], to: [12, 21] },
    { name: "Capricorn", from: [12, 22], to: [12, 31] },
  ];

  const match = signs.find(
    (sign) =>
      (month === sign.from[0] && day >= sign.from[1]) ||
      (month === sign.to[0] && day <= sign.to[1]),
  );

  return match?.name ?? "";
}

export function mbtiFromAnswers(answers: Array<"a" | "b">): string {
  const safe = [...answers, "a", "a", "a", "a"] as Array<"a" | "b">;
  const dimensions = [
    safe[0] === "a" ? "E" : "I",
    safe[1] === "a" ? "N" : "S",
    safe[2] === "a" ? "T" : "F",
    safe[3] === "a" ? "J" : "P",
  ];

  return dimensions.join("");
}

