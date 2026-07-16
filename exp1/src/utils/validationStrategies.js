// ---------------------------------------------------------------------------
// Strategy Design Pattern
// ---------------------------------------------------------------------------
// Each platform owns its own validation "strategy" (a limit + a validate fn).
// Adding a new platform means adding one entry here -- nothing else in the
// app needs to change. This satisfies the open/closed principle called out
// in the experiment sheet (Section 5, Strategy Design Pattern).
// ---------------------------------------------------------------------------

export const platforms = {
  twitter: {
    key: 'twitter',
    label: 'Twitter / X',
    limit: 280,
    color: '#4AA8E0',
    hint: 'Short & punchy. Threads are better than walls of text.',
    validate: (text) => {
      if (text.trim().length === 0) return 'Post cannot be empty.'
      if (text.length > 280) return `Exceeds Twitter limit by ${text.length - 280} characters.`
      return null
    },
  },
  linkedin: {
    key: 'linkedin',
    label: 'LinkedIn',
    limit: 3000,
    color: '#3E7CB1',
    hint: 'Room for context. Lead with the insight, not the story.',
    validate: (text) => {
      if (text.trim().length === 0) return 'Post cannot be empty.'
      if (text.length > 3000) return `Exceeds LinkedIn limit by ${text.length - 3000} characters.`
      return null
    },
  },
  instagram: {
    key: 'instagram',
    label: 'Instagram',
    limit: 2200,
    color: '#E1306C',
    hint: 'Caption + hashtags. Front-load the hook before the "more" cut.',
    validate: (text) => {
      if (text.trim().length === 0) return 'Caption cannot be empty.'
      if (text.length > 2200) return `Exceeds Instagram caption limit by ${text.length - 2200} characters.`
      const hashtagCount = (text.match(/#[\w]+/g) || []).length
      if (hashtagCount > 30) return `Too many hashtags (${hashtagCount}/30 max).`
      return null
    },
  },
}

export const platformList = Object.values(platforms)

// Runtime strategy selection -- the core of the pattern.
export function validateForPlatform(platformKey, text) {
  const strategy = platforms[platformKey]
  if (!strategy) return 'Unknown platform selected.'
  return strategy.validate(text)
}
