import {defineType, defineField, defineArrayMember} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'

/**
 * A single source entry, reused by both source lists on an article.
 *
 * `kind` lets an editor say what the source *is* (article, video, forum
 * post, …) while `credit` covers the "image courtesy of …" case where
 * there may be no URL at all.
 */
const sourceItem = defineArrayMember({
  type: 'object',
  name: 'sourceItem',
  title: 'Source',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title / description',
      type: 'string',
      description: 'What is being cited, e.g. "Kodak Portra 400 datasheet".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Optional — link to the source.',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https', 'mailto']}),
    }),
    defineField({
      name: 'author',
      title: 'Author / publisher',
      type: 'string',
      description: 'Optional — who made or published it.',
    }),
    defineField({
      name: 'kind',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          {title: 'Article / page', value: 'article'},
          {title: 'Datasheet / documentation', value: 'datasheet'},
          {title: 'Video', value: 'video'},
          {title: 'Forum / discussion', value: 'forum'},
          {title: 'Book / paper', value: 'book'},
          {title: 'Software', value: 'software'},
          {title: 'Other', value: 'other'},
        ],
      },
    }),
    defineField({
      name: 'note',
      title: 'Note',
      type: 'string',
      description: 'Optional extra context, e.g. "figure 3 adapted from this".',
    }),
  ],
  preview: {
    select: {title: 'title', author: 'author', url: 'url'},
    prepare({title, author, url}) {
      return {
        title: title || 'Source',
        subtitle: author || url,
      }
    },
  },
})

/**
 * Article Sources — the reference list shown at the end of an article.
 *
 * Split into two lists so image/figure credits stay separate from the
 * general reading references.
 */
export const articleSources = defineType({
  name: 'articleSources',
  title: 'Sources',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'Defaults to "Sources".',
      initialValue: 'Sources',
    }),
    defineField({
      name: 'general',
      title: 'General sources',
      description: 'References used for the article text itself.',
      type: 'array',
      of: [sourceItem],
    }),
    defineField({
      name: 'images',
      title: 'Image & figure sources',
      description:
        'Credits for images, figures, diagrams and charts used in the article.',
      type: 'array',
      of: [sourceItem],
    }),
    defineField({
      name: 'note',
      title: 'Closing note',
      type: 'text',
      rows: 2,
      description:
        'Optional note shown under the lists, e.g. "All images shot and scanned by the author unless noted."',
    }),
  ],
  options: {collapsible: true, collapsed: true},
})
