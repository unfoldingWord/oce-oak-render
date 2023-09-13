import React, { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { PrintModal, useUsfmPreviewRenderer } from '@oce-editor-tools/core'
import DOMPurify from 'dompurify'
import markup from '../lib/drawdown'
import { fileOpen } from 'browser-fs-access'
import { styled } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import MenuIcon from '@mui/icons-material/Menu'
import PrintIcon from '@mui/icons-material/Print'
import Paper from '@mui/material/Paper'
import { ThemeProvider } from '@mui/material/styles'
import Drawer from '@mui/material/Drawer'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

const drawerWidth = 240

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}))

export default function AppWorkspace() {
  const theme = useTheme()
  const [markupHtmlStr, setMarkupHtmlStr] = useState("")
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [isOpen,setIsOpen] = useState(false)
  const [mdFileLoaded, setMdFileLoaded] = useState(false)
  const [usfmText, setUsfmText] = useState()
  const [usfmFileLoaded, setUsfmFileLoaded] = useState(false)

  const handleDrawerOpen = () => {
    setDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
  }

  const handleOpen = async () => {
    const file = await fileOpen([
      {
        description: 'USFM and Markup - text files',
        mimeTypes: ['text/*'],
        extensions: ['.md','.usfm'],
      }
    ])
    const filePath = file?.name
    if (filePath !== null) {
      const extStr = filePath?.substring(filePath?.lastIndexOf("."))
      if (extStr === ".md") {
        const contents = await file.text()
        setMarkupHtmlStr(markup(contents))
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
    onRenderContent: () => markupHtmlStr,
  }

  const { 
    renderedData, 
    ready: htmlReady 
  } = useUsfmPreviewRenderer({ 
    usfmText, 
    htmlRender: true
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
        { mdFileLoaded && (<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(markupHtmlStr)}}/>)}
        { usfmFileLoaded && <PrintModal {...usfmPreviewProps} />}
        { usfmFileLoaded && (htmlReady ? <div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(renderedData)}}/>: "Loading") }
    </div>

  const enabledPrintPreview = (usfmFileLoaded || mdFileLoaded)

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper sx={{ position: 'fixed', top: 0, left: 0, right: 0 }} elevation={3}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              onClick={handleDrawerOpen}
              aria-label="open drawer"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
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
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="persistent"
          anchor="left"
          open={drawerOpen}
        >
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            <ListItem key={'Open'} disablePadding>
              <ListItemButton onClick={handleOpen}>
                <ListItemIcon>
                  <FolderOpenIcon/> : 
                </ListItemIcon>
                <ListItemText primary={'Open'} />
              </ListItemButton>
            </ListItem>
            <ListItem key={'Print Preview'} disablePadding>
              <ListItemButton onClick={handlePrintPreviewClick}>
                <ListItemIcon>
                  <PrintIcon/>
                </ListItemIcon>
                <ListItemText primary={'Print Preview'} />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>
      </Paper>
      {appBarAndWorkSpace}
    </Box>
  )
}
