import { PERSONAS } from "./personas";

export function weightedRandomPersonaId(): number {
    const totalWeight = PERSONAS.reduce((sum, p) => sum + p.weight, 0);

    let random = Math.random() * totalWeight;

    for (const persona of PERSONAS) {
        random -= persona.weight;

        if (random <= 0) {
            return persona.id;
        }
    }

    return PERSONAS[PERSONAS.length - 1].id;
}