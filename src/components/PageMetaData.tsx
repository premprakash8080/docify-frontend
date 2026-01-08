type PageMetaDataProps = {
  title: string
  description?: string
  keywords?: string
}

const defaultPageMetaData: PageMetaDataProps = {
  title: 'Docify',
  description:
    'Docify is a modern document management system. Ideal for organizing notes, files, notebooks, and managing your documents with a clean UI, flexible layouts, and rich features.',
  keywords:
    'Docify, document management, notes, files, notebooks, document organization, productivity, note-taking, file management',
}

const PageMetaData = ({ title, description = defaultPageMetaData.description, keywords = defaultPageMetaData.keywords }: PageMetaDataProps) => {
  return (
    <>
      <title>{title ? `${title} | ${defaultPageMetaData.title}` : defaultPageMetaData.title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
    </>
  )
}
export default PageMetaData
