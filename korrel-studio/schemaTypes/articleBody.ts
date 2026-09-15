import {defineType, defineField, defineArrayMember} from 'sanity'
import {InfoOutlineIcon} from '@sanity/icons/InfoOutline'
import {articleImageFields, articleImagePreview} from './articleImageFields'

/**
 * Article Body — the flexible editor used by Wiki articles.
 *
 * The body is a free sequence of blocks, so an editor can alternate
 * text → images → text → comparison → text as often as needed:
 *
 * - `block`           rich text with headings, lists, quotes and marks
 * - `image`           a single full-width image with metadata
 * - `imageGroup`      1–4 images per row, layout chosen per group
 * - `imageComparison` slider / overlay switch / slideshow
 * - `callout`         a highlighted note box
 */
export const articleBody = defineType({
  name: 'articleBody',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'Heading 2', value: 'h2'},
        {title: 'Heading 3', value: 'h3'},
        {title: 'Heading 4', value: 'h4'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bulleted', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Bold', value: 'strong'},
          {title: 'Italic', value: 'em'},
          {title: 'Underline', value: 'underline'},
          {title: 'Strike', value: 'strike-through'},
          {title: 'Code', value: 'code'},
          {title: 'Highlight', value: 'highlight'},
        ],
        annotations: [
          defineArrayMember({
            type: 'object',
            name: 'link',
            title: 'External link',
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
                validation: (Rule) => Rule.uri({scheme: ['http', 'https', 'mailto', 'tel']}),
              }),
              defineField({
                name: 'newTab',
                title: 'Open in new tab',
                type: 'boolean',
                initialValue: true,
              }),
            ],
          }),
          defineArrayMember({
            type: 'object',
            name: 'internalLink',
            title: 'Link to another article',
            fields: [
              defineField({
                name: 'reference',
                title: 'Article',
                type: 'reference',
                to: [{type: 'wikiArticle'}],
                validation: (Rule) => Rule.required(),
              }),
            ],
          }),
        ],
      },
    }),

    /* ---- A single image ---- */
    defineArrayMember({
      type: 'image',
      title: 'Image',
      options: {hotspot: true},
      fields: articleImageFields,
      preview: articleImagePreview,
    }),

    /* ---- Several images with a chosen layout ---- */
    defineArrayMember({type: 'imageGroup'}),

    /* ---- Comparisons: slider / overlay switch / slideshow ---- */
    defineArrayMember({type: 'imageComparison'}),

    /* ---- Highlighted note ---- */
    defineArrayMember({
      type: 'object',
      name: 'callout',
      title: 'Callout',
      icon: InfoOutlineIcon,
      fields: [
        defineField({
          name: 'tone',
          title: 'Tone',
          type: 'string',
          options: {
            list: [
              {title: 'Note', value: 'note'},
              {title: 'Tip', value: 'tip'},
              {title: 'Warning', value: 'warning'},
            ],
            layout: 'radio',
          },
          initialValue: 'note',
        }),
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
        }),
        defineField({
          name: 'text',
          title: 'Text',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.required(),
        }),
      ],
      preview: {
        select: {title: 'title', text: 'text', tone: 'tone'},
        prepare({title, text, tone}) {
          const tones: Record<string, string> = {
            note: 'Note',
            tip: 'Tip',
            warning: 'Warning',
          }
          return {
            title: title || text || 'Callout',
            subtitle: tones[tone as string] ?? 'Callout',
          }
        },
      },
    }),
  ],
})
