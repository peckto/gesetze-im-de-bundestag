import { useEffect, useMemo, useState, Dispatch } from 'react'
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import './App.css'
import { Chip, Divider, Link } from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';

import FormLabel from '@mui/material/FormLabel';import { BarChart } from '@mui/x-charts';
import * as d3 from 'd3-array'

interface FilterSachgebietProps {
  gesetzeOpen: Gesetz[];
  setGesetzeView: Dispatch<Gesetz[]>;
  setState: Dispatch<boolean>;
}

function FilterSachgebiet(props: FilterSachgebietProps) {
  const [val, setVal_] = useState<string[]>([]);

  function setVal(newValue: string[]) {
    setVal_(newValue);
    props.setState(newValue.length > 0);
    const gesetzeFiltered = props.gesetzeOpen.filter((it) => it.sachgebiet?.some((s) => newValue.includes(s)));
    props.setGesetzeView(gesetzeFiltered.length > 0 ? gesetzeFiltered : props.gesetzeOpen);
  }

  const sachgebiete: string[] = [... d3.sort(new Set(props.gesetzeOpen.flatMap((it) => it.sachgebiet || [])))];

  return (
    <div>
      <Autocomplete
        multiple
        id="tags-standard"
        freeSolo={false}
        filterSelectedOptions
        options={sachgebiete}
        onChange={(_, newValue) => {
          setVal(newValue);
        }}
        renderTags={(options) =>
          options.map((option) => {
            return (
              <Chip
                key={option}
                label={option}
                onDelete={() => {
                  setVal(val.filter((entry) => entry !== option));
                }}
              />
            );
          })
        }
        isOptionEqualToValue={(option, value) => option === value}
        value={val}
        renderInput={(params) => (
          <TextField {...params} variant="standard" placeholder="Sachgebiet" margin="normal" fullWidth />
        )}
      />
    </div>
  );
}


interface Gesetz {
  id: string;
  titel: string;
  beratungsstand: string;
  sachgebiet?: string[];
  vorgangsdauer: number;
  zustimmungsbeduerftigkeit: string[];
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

// all beratungsstand to display in board
const beratungsstand_runnng = [
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

function KanbanBoard({gesetze}: KanbanBoardProps) {
  const gesetzeOpen = useMemo<Gesetz[]>(() => gesetze.filter(it => beratungsstand_runnng.includes(it.beratungsstand)), [gesetze])
  const [gesetzeFilterSachgebiet, setGesetzeFilterSachebiet] = useState<Gesetz[]>([])
  const [gesetzeFilterTitle, setGesetzeFilterTitle] = useState<Gesetz[]>([])
  const [filterTitleActive, setFilterTitleActive] = useState<boolean>(false);
  const [filterSachgebietActive, setFilterSachgebietActive] = useState<boolean>(false);

  const gesetzeViewSachgebiet = useMemo<Gesetz[]>(() => filterSachgebietActive ? gesetzeFilterSachgebiet : gesetzeOpen, [filterSachgebietActive, gesetzeFilterSachgebiet, gesetzeOpen]);
  const gesetzeViewTitle = useMemo<Gesetz[]>(() => filterTitleActive ? gesetzeFilterTitle : gesetzeViewSachgebiet, [filterTitleActive, gesetzeFilterTitle, gesetzeViewSachgebiet]);

  const colSize = 400

  return (
    <>
    <h2>Kanban Board Gesetzesvorhaben</h2>
    <Paper>
    <Grid container spacing={2}>
      <Grid xs={1}>
        Filter
      </Grid>
      <Grid xs={7}>
        <FilterSachgebiet gesetzeOpen={gesetzeOpen} setGesetzeView={setGesetzeFilterSachebiet} setState={setFilterSachgebietActive} />
      </Grid>
      <Grid xs={4}>
        <TextField id="standard-basic" label="Title" variant="standard" onChange={(e) => {
          setFilterTitleActive(e.target.value.length > 0)
          setGesetzeFilterTitle(gesetzeViewTitle.filter((it) => it.titel.indexOf(e.target.value) > 0))
          }} />
      </Grid>
    </Grid>
    </Paper>

    <Grid container spacing={2} sx={{ width: colSize*12 }}>
    {
    beratungsstand_runnng.map(it => (
      <Grid sx={{ width: colSize }} xs={1} key={it}>{it}</Grid>
    ))
    }
    {
    beratungsstand_runnng.map(it => {
      const data = gesetzeViewTitle.filter(g => g.beratungsstand === it)
      return <Grid sx={{ width: colSize }} xs={1} key={it}>
        {data.map(g => <GesetzCard key={g.id} {...g} />)}
        </Grid>
    })
    }
    </Grid>
    </>
  )
}

function Statistics({gesetze}: KanbanBoardProps) {
  const [value, setValue] = useState('published');
  const bins = [7, 14, 30, 60, 120, 240, 365];
  const bins_label = [...bins, '>365']
  var gesetze_filtered = undefined
  if (value === 'published') {
    gesetze_filtered = gesetze.filter(g => g.beratungsstand == 'Verkündet')
  } else if (value === 'running') {
    gesetze_filtered = gesetze.filter(it => beratungsstand_runnng.includes(it.beratungsstand))
  } else {
    gesetze_filtered = gesetze
  }
  const gesetze_bt = gesetze_filtered.filter(g => g.zustimmungsbeduerftigkeit.filter(z => z.startsWith('Ja')).length === 0)
  const gesetze_br = gesetze_filtered.filter(g => g.zustimmungsbeduerftigkeit.filter(z => z.startsWith('Ja')).length !== 0)
  const bin = d3.bin<Gesetz, number>().domain([0, 9999]).thresholds(bins.map(v => v+1)).value(d => d.vorgangsdauer)
  const hist_bt = bin(gesetze_bt);
  const hist_br = bin(gesetze_br);
  const hist = bin(gesetze_filtered);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  return (
    <>
    <h2>Statistics</h2>
    <FormControl>
      <FormLabel id="demo-controlled-radio-buttons-group">Gesetz Status</FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-controlled-radio-buttons-group"
        name="controlled-radio-buttons-group"
        value={value}
        onChange={handleChange}
      >
        <FormControlLabel value="published" control={<Radio />} label="Veröffentlicht" />
        <FormControlLabel value="all" control={<Radio />} label="Alle" />
        <FormControlLabel value="running" control={<Radio />} label="Offen" />
      </RadioGroup>
    </FormControl>
    <BarChart
      width={700}
      height={500}
      series={[
        { data: hist_bt.map(b => b.length), label: 'Gesetze Bundestag', id: 'bt' },
        { data: hist_br.map(b => b.length), label: 'Gesetze Bundestag+Bundesrat', id: 'br' }
      ]}
      xAxis={[{ scaleType: 'band', data: bins_label, id: 'vorgang-duration', label: 'Vorgang Dauer in Tagen' }]}
      legend={{
        direction: "column",
        position: {
          vertical: "top",
          horizontal: "middle"
        }
      }}
    >
    </BarChart>
    {
      hist.map((gesetze, idx) => (
      <Accordion key={"Accordion-"+bins[idx]}>
        <AccordionSummary
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Vorgang Dauer {bins_label[idx]} Tage</Typography>
        </AccordionSummary>
        <AccordionDetails>
        {gesetze.map(g => <GesetzCard key={g.id} {...g} />)}
        </AccordionDetails>
      </Accordion>
      ))
    }
    
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

  return (
    <>
    <div id='headline'>
    <h1>Überblick zu Gesetzesvorhaben der Deutschen Bundesregierung in der 20. Wahlperiode</h1>
    <h3>Disclaimer: Diese Seite befindet sich noch im Aufbau und kann falsche oder unfollständige Informationen beinhalten.</h3>
    <p>Quelle: <a href="https://dip.bundestag.de">https://dip.bundestag.de/</a>, <a href="https://search.dip.bundestag.de/api/v1/swagger-ui/#">https://search.dip.bundestag.de/api/v1/swagger-ui/#</a></p>
    <p>Stand: 25.09.2023</p>
    <p>Fork me on GitHub: <a href="https://github.com/peckto/gesetze-im-de-bundestag">https://github.com/peckto/gesetze-im-de-bundestag</a></p>
    <Divider />
    </div>
    <br />
    
    <Statistics gesetze={gesetze}/>
    <Divider sx={{ m: 10 }} />
    <KanbanBoard gesetze={gesetze}/>
    </>
  )
}

export default App
