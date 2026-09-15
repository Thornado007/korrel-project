import type {StructureResolver} from 'sanity/structure'
import {HomeIcon} from '@sanity/icons/Home'
import {DocumentIcon} from '@sanity/icons/Document'
import {ImagesIcon} from '@sanity/icons/Images'
import {StarIcon} from '@sanity/icons/Star'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {FolderIcon} from '@sanity/icons/Folder'
import {TagIcon} from '@sanity/icons/Tag'

/**
 * Studio navigation.
 *
 * The existing page documents (Home, About, Service, Gallery) already live
 * in the dataset with generated IDs, so they stay as normal document lists
 * — pinning a fixed ID would create a second, empty copy of each. Only the
 * brand-new Wiki Page is pinned as a true singleton.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('homePage').title('Home Page').icon(HomeIcon),
      S.documentTypeListItem('aboutPage').title('About Page').icon(DocumentIcon),
      S.documentTypeListItem('servicePage').title('Service Page').icon(DocumentIcon),
      S.documentTypeListItem('galleryPage').title('Gallery Page').icon(ImagesIcon),
      S.listItem()
        .title('Wiki Page')
        .icon(StarIcon)
        .child(S.document().schemaType('wikiPage').documentId('wikiPage')),

      S.divider(),

      S.documentTypeListItem('wikiArticle').title('Wiki Articles').icon(DocumentTextIcon),
      S.documentTypeListItem('wikiCategoryPage').title('Wiki Categories').icon(FolderIcon),
      S.documentTypeListItem('scanningService').title('Scanning Services'),
      S.documentTypeListItem('scanGallery').title('Scan Gallery').icon(ImagesIcon),

      S.divider(),

      S.documentTypeListItem('tag').title('Tags').icon(TagIcon),
      S.documentTypeListItem('taxonomyCategory').title('Taxonomy Categories').icon(FolderIcon),
    ])
