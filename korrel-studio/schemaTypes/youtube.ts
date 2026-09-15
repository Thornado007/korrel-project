import {defineType, defineField} from 'sanity'
import {PlayIcon} from '@sanity/icons/Play'

/**
 * Matches the YouTube URL shapes editors actually paste:
 * - https://www.youtube.com/watch?v=ID
 * - https://youtu.be/ID
 * - https://www.youtube.com/embed/ID
 * - https://www.youtube.com/shorts/ID
 * - https://www.youtube.com/live/ID
 */
const YOUTUBE_URL =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/

/** Extract the 11-character video ID from any supported YouTube URL. */
export function youTubeIdFromUrl(url?: string): string | null {
  if (!url) return null
  return url.match(YOUTUBE_URL)?.[1] ?? null
}

/**
 * YouTube — an embedded video in an article body.
 *
 * The frontend renders the video thumbnail with a play button and only
 * loads the actual YouTube player once the reader clicks it, so articles
 * with several videos stay fast and no third-party scripts run up front.
 */
export const youtube = defineType({
  name: 'youtube',
  title: 'YouTube Video',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'url',
      title: 'YouTube URL',
      type: 'url',
      description:
        'Paste any YouTube link — watch, youtu.be, shorts or embed. The thumbnail is fetched automatically.',
      validation: (Rule) =>
        Rule.required().custom((value) =>
          !value || youTubeIdFromUrl(value)
            ? true
            : 'That does not look like a YouTube video link.'
        ),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Shown above the video. Optional.',
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Shown underneath the video. Optional.',
    }),
    defineField({
      name: 'startAt',
      title: 'Start at (seconds)',
      type: 'number',
      description: 'Optional — start playback at this many seconds in.',
      validation: (Rule) => Rule.min(0),
    }),
  ],
  preview: {
    select: {title: 'title', caption: 'caption', url: 'url'},
    prepare({title, caption, url}) {
      return {
        title: title || caption || 'YouTube Video',
        subtitle: youTubeIdFromUrl(url) ? `youtube.com · ${youTubeIdFromUrl(url)}` : url,
      }
    },
  },
})
