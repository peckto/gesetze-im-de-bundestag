import { useEffect, useMemo, useState } from 'react'
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import './App.css'
import { Chip, Divider, Link } from '@mui/material';

interface Gesetz {
  id: string;
  titel: string;
  beratungsstand: string;
  sachgebiet?: string[];
}

function GesetzCard(gesetz: Gesetz) {
  return (
    <Card sx={{ minWidth: 275, m: 2 }}>
      <CardContent>
        {gesetz.titel}
        <Divider sx={{ m: 1 }} />
      {gesetz.sachgebiet?.map(sachgebiet => 
        <Chip key={sachgebiet} label={sachgebiet} />
      )}
      </CardContent>
      <CardActions>
        <Link href={`https://dip.bundestag.de/vorgang/g/${gesetz.id}`}>More</Link>
      </CardActions>
    </Card>
  );
}

interface KanbanBoardProps {
  gesetze: Gesetz[];
}

function KanbanBoard({gesetze}: KanbanBoardProps) {
  // all beratungsstand to display in board
  const beratungsstand = [
    'Dem Bundesrat zugeleitet - Noch nicht beraten',
    'Überwiesen',
    '1. Durchgang im Bundesrat abgeschlossen',
    'Noch nicht beraten',
    'Beschlussempfehlung liegt vor',
    'Dem Bundestag zugeleitet - Noch nicht beraten',
    'Bundesrat hat Vermittlungsausschuss nicht angerufen',
    'Bundesrat hat zugestimmt',
    'Vermittlungsvorschlag angenommen',
    'Verabschiedet',
    'Angenommen',
    'Den Ausschüssen zugewiesen'
  ]
  const gesetzeOpen = useMemo<Gesetz[]>(() => gesetze.filter(it => beratungsstand.includes(it.beratungsstand)), [gesetze])
  const colSize = 400

  return (
    <>
    <div id='headline'>
    <h3>Disclaimer: Diese Seite befindet sich noch im Aufbau und kann falsche oder unfollständige Informationen beinhalten.</h3>
    <p>Quelle: <a href="https://dip.bundestag.de">https://dip.bundestag.de/</a>, <a href="https://search.dip.bundestag.de/api/v1/swagger-ui/#">https://search.dip.bundestag.de/api/v1/swagger-ui/#</a></p>
    <p>Stand: 25.09.2023</p>
    <p>Fork me on GitHub: <a href="https://github.com/peckto/gesetze-im-de-bundestag">https://github.com/peckto/gesetze-im-de-bundestag</a></p>
    <Divider />
    </div>
    <br />
    
    <Grid container spacing={2} sx={{ width: colSize*12 }}>
    {
    beratungsstand.map(it => (
      <Grid sx={{ width: colSize }} xs={1}>{it}</Grid>
    ))
    }
    {
    beratungsstand.map(it => {
      const data = gesetzeOpen.filter(g => g.beratungsstand === it)
      return <Grid sx={{ width: colSize }} xs={1}>
        {data.map(g => <GesetzCard key={g.id} {...g} />)}
        </Grid>
    })
    }
    </Grid>
    </>
  )
}

function App() {
  const [gesetze, setGesetze] = useState<Gesetz[]>([])

  useEffect(() => {
    fetch('gesetze.json')
    .then(response => response.json())
    .then(data => setGesetze(data))
  }, [setGesetze])

  return <KanbanBoard gesetze={gesetze}/>
}

export default App
