export const handleStringLen = (text: string, min = 0, max = 20) => {
    if (text.length < min) {
        return ""
    }

    if (text.length > max) {
        return text.substring(min, max) + ".."
    }

    return text
}