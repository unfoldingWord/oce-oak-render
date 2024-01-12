import { useState } from 'react'
import SimpleEditor from './SimpleEditor'
import { fileOpen } from 'browser-fs-access'
import Header from './Header'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress';

export default function AppLayout() {
  const [usfmText, setUsfmText] = useState()
  const [loading, setLoading] = useState(false)
  const [usfmFileLoaded, setUsfmFileLoaded] = useState(false)

  const handleOpen = async () => {
    setLoading(true)
    const file = await fileOpen([
      {
        description: 'USFM - text files',
        mimeTypes: ['text/*'],
        extensions: ['.usfm'],
      }
    ])
    const filePath = file?.name
    if (filePath !== null) {
      const extStr = filePath?.substring(filePath?.lastIndexOf("."))
      if (extStr === ".usfm") {
        const contents = await await file.text()
        setUsfmText(contents)
        setUsfmFileLoaded(true)
        setLoading(false)
      } else {
        console.log("invalid file extension")
      }
    } else {
      console.log("invalid file")
    }
  }

  const editorProps = {
    docSetId: 'abc-xyz',
    usfmText,
    defaultOptions:{
      editable: false,
      sectionable: false,
      blockable: false,
      preview: true,
    }
  }
 
  const appBarAndWorkSpace = 
    <div>
      { usfmFileLoaded && <SimpleEditor {...editorProps } />}
    </div>

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper sx={{ position: 'fixed', top: 0, left: 0, right: 0 }} elevation={3}>
        {!usfmFileLoaded && !loading && 
          (<Header 
            title={"OCE Oak Render"}
            onOpenClick={handleOpen}
          />)}
      </Paper>
      {!loading ? appBarAndWorkSpace : (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            paddingTop: '150px' 
          }}>
          <CircularProgress disableShrink/>
        </Box>
      )}
      </Box>
  )
}
