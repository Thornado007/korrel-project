import {defineType, defineField, defineArrayMember} from 'sanity'

/**
 * Scanning Service — one document per scanning service offering
 * (e.g. "GFX Camera Scanning", "Nikon Coolscan 5000").
 *
 * Services are displayed as full-width cards stacked vertically on the
 * /services page. Each service can include:
 * - An example scan hero image (lightbox zoom)
 * - Rich-text body
 * - Process-step sets showing side-by-side comparisons (e.g. raw → inverted → edited)
 * - A small gallery of additional example images
 */
export const scanningService = defineType({
  name: 'scanningService',
  title: 'Scanning Service',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Service name, e.g. "Nikon Coolscan 5000".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'orderRank',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first on the page.',
      initialValue: 0,
    }),
    defineField({
      name: 'exampleScan',
      title: 'Example Scan',
      type: 'image',
      options: {hotspot: true},
      description:
        'A main example scan for this service. Shown as the hero image at the top of the card.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description: 'Describe the service — text, headings, and images.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
          ],
          lists: [
            {title: 'Bulleted', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: [
              defineArrayMember({
                type: 'object',
                name: 'link',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    validation: (Rule) =>
                      Rule.uri({scheme: ['http', 'https', 'mailto', 'tel']}),
                  }),
                ],
              }),
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
            }),
          ],
        }),
      ],
    }),

    /* ---- Process Steps ---- */
    defineField({
      name: 'processSteps',
      title: 'Process Steps',
      type: 'array',
      description:
        'Show processing stages side by side (e.g. Raw Scan → Inverted → Final Edit). Each set displays its images in a row.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'processStepSet',
          title: 'Process Step Set',
          fields: [
            defineField({
              name: 'title',
              title: 'Set Title',
              type: 'string',
              description: 'Optional title above this row of images, e.g. "Processing stages for Portra 400".',
            }),
            defineField({
              name: 'steps',
              title: 'Steps',
              type: 'array',
              validation: (Rule) => Rule.min(2).max(6),
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'processStep',
                  title: 'Step',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      description: 'e.g. "Raw Scan", "Inverted", "Final Edit"',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'image',
                      title: 'Image',
                      type: 'image',
                      options: {hotspot: true},
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'label',
                      media: 'image',
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'title',
              step0: 'steps.0.label',
              step1: 'steps.1.label',
              step2: 'steps.2.label',
            },
            prepare({title, step0, step1, step2}) {
              const labels = [step0, step1, step2].filter(Boolean).join(' → ')
              return {
                title: title || 'Process Steps',
                subtitle: labels || undefined,
              }
            },
          },
        }),
      ],
    }),

    /* ---- Pricing Tiers ---- */
    defineField({
      name: 'pricingTiers',
      title: 'Pricing Tiers',
      type: 'array',
      description:
        'Pricing options for this service, displayed side by side (max 3 per row). E.g. "RAW Scan Only", "Flat Inversion", "Extra Post-Processing".',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'pricingTier',
          title: 'Pricing Tier',
          fields: [
            defineField({
              name: 'title',
              title: 'Tier Title',
              type: 'string',
              description: 'e.g. "RAW Scan Only", "Flat Inversion"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 4,
              description:
                'Explain what is included in this tier.',
            }),
            defineField({
              name: 'priceLines',
              title: 'Price Lines',
              type: 'array',
              description:
                'Individual price lines. Leave empty for tiers with custom/variable pricing.',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'priceLine',
                  title: 'Price Line',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      description: 'e.g. "Uncut film roll", "Colour negative"',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'price',
                      title: 'Price',
                      type: 'string',
                      description: 'e.g. "€7", "+€5 per roll | +€1 per frame"',
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'label',
                      subtitle: 'price',
                    },
                  },
                }),
              ],
            }),
            defineField({
              name: 'note',
              title: 'Note',
              type: 'text',
              rows: 2,
              description:
                'Optional footnote shown below the price lines, e.g. "Pricing depends on the scope and time required."',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              line0: 'priceLines.0.label',
              line1: 'priceLines.1.label',
            },
            prepare({title, line0, line1}) {
              const lines = [line0, line1].filter(Boolean).join(', ')
              return {
                title: title || 'Pricing Tier',
                subtitle: lines || 'No price lines',
              }
            },
          },
        }),
      ],
    }),

    /* ---- Gallery ---- */
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      description: 'A small gallery of example images for this service.',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'maxGalleryImages',
      title: 'Max Gallery Images to Show',
      type: 'number',
      description: 'Maximum number of gallery images to display on the page. Leave empty to show all.',
      validation: (Rule) => Rule.min(1),
    }),
  ],
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{field: 'orderRank', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'orderRank',
      media: 'exampleScan',
    },
    prepare({title, subtitle, media}) {
      return {
        title: title || 'Scanning Service',
        subtitle: subtitle != null ? `Order: ${subtitle}` : undefined,
        media,
      }
    },
  },
})
