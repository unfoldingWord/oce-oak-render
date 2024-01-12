import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { useUsfmPreviewRenderer } from '@oce-editor-tools/base'
import { PrintModal } from '@oce-editor-tools/mui-core'
import DOMPurify from 'dompurify'
import markdown from '../lib/drawdown'
import { fileOpen } from 'browser-fs-access'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import PrintIcon from '@mui/icons-material/Print'
import Paper from '@mui/material/Paper'
import { ThemeProvider } from '@mui/material/styles'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import { getRtlPreviewStyle } from "../lib/previewStyling.js";


export default function AppWorkspace() {
  const theme = useTheme()
  const [markdownHtmlStr, setMarkdownHtmlStr] = useState("")
  const [isOpen,setIsOpen] = useState(false)
  const [mdFileLoaded, setMdFileLoaded] = useState(false)
  const [usfmText, setUsfmText] = useState()
  const [usfmFileLoaded, setUsfmFileLoaded] = useState(false)

  const handleOpen = async () => {
    const file = await fileOpen([
      {
        description: 'USFM and Markdown - text files',
        mimeTypes: ['text/*'],
        extensions: ['.md','.usfm'],
      }
    ])
    const filePath = file?.name
    if (filePath !== null) {
      const extStr = filePath?.substring(filePath?.lastIndexOf("."))
      if (extStr === ".md") {
        const contents = await file.text()
        setMarkdownHtmlStr(markdown(contents))
        setUsfmFileLoaded(false)
        setMdFileLoaded(true)
      } else if (extStr === ".usfm") {
        const contents = await await file.text()
        setUsfmText(contents)
        setUsfmFileLoaded(true)
        setMdFileLoaded(false)
      } else {
        console.log("invalid file extension")
      }
    } else {
      console.log("invalid file")
    }
  }

  const handlePrintPreviewClick = () => setIsOpen(!isOpen)

  const mdPreviewProps = {
    openPrintModal: isOpen && mdFileLoaded,
    handleClosePrintModal: () => {
      console.log('closePrintModal')
      setIsOpen(false)
    },
    onRenderContent: () => markdownHtmlStr,
  }

  const { 
    renderedData, 
    ready: htmlReady 
  } = useUsfmPreviewRenderer({ 
    usfmText, 
    htmlRender: true,
    renderStyles: getRtlPreviewStyle(),
  })

  const usfmPreviewProps = {
    openPrintModal: isOpen && usfmFileLoaded && htmlReady,
    handleClosePrintModal: () => {
      console.log('closePrintModal')
      setIsOpen(false)
    },
    onRenderContent: () => renderedData,
    canChangeAtts: true,
    canChangeColumns: true,
  }

  const appBarAndWorkSpace = 
    <div style={{paddingTop: '100px'}}>
        { mdFileLoaded && <PrintModal {...mdPreviewProps} />}
        { mdFileLoaded && (<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(markdownHtmlStr)}}/>)}
        { usfmFileLoaded && <PrintModal {...usfmPreviewProps} />}
        { usfmFileLoaded && (htmlReady ? <div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(renderedData)}}/>: "Loading") }
    </div>

  const enabledPrintPreview = (usfmFileLoaded || mdFileLoaded)

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper sx={{ position: 'fixed', top: 0, left: 0, right: 0 }} elevation={3}>
        <AppBar position="static">
          <Toolbar>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
            >
              OCE OAK RENDER
            </Typography>
            <ThemeProvider theme={theme}>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                onClick={handleOpen}
                aria-label="print preview"
                sx={{ mr: 2 }}
              >
                <FolderOpenIcon/>
              </IconButton>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                onClick={handlePrintPreviewClick} 
                disabled={!enabledPrintPreview}
                aria-label="print preview"
                sx={{ mr: 2 }}
              >
                <PrintIcon/>
              </IconButton>
            </ThemeProvider>
            {/* <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search> */}
          </Toolbar>
        </AppBar>
      </Paper>
      {appBarAndWorkSpace}
    </Box>
  )
}
