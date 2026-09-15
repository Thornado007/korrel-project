import {scanGallery} from './scanGallery'
import {wikiArticle} from './wikiArticle'
import {wikiCategoryPage} from './wikiCategoryPage'
import {wikiPage} from './wikiPage'
import {tag} from './tag'
import {taxonomyCategory} from './taxonomyCategory'
import {homePage} from './homePage'
import {aboutPage} from './aboutPage'
import {servicePage} from './servicePage'
import {scanningService} from './scanningService'
import {galleryPage} from './galleryPage'
import {articleBody} from './articleBody'
import {imageGroup} from './imageGroup'
import {imageComparison} from './imageComparison'

export const schemaTypes = [
  // Documents
  scanGallery,
  wikiArticle,
  wikiCategoryPage,
  wikiPage,
  tag,
  taxonomyCategory,
  homePage,
  aboutPage,
  servicePage,
  scanningService,
  galleryPage,

  // Reusable article building blocks
  articleBody,
  imageGroup,
  imageComparison,
]
