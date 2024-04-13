import { useEffect, useMemo, useState } from 'react'
import Grid from '@mui/material/Grid';
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
import Box from '@mui/material/Box';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import FormLabel from '@mui/material/FormLabel';
import { BarChart } from '@mui/x-charts';
import * as d3 from 'd3-array'

type filterCallbackType = (a: string[]) => void;

interface FilterWidgetProps {
  callback: filterCallbackType;
  options: string[];
  placeholder: string;
}

function FilterWidget(props: FilterWidgetProps) {
  const [val, setVal_] = useState<string[]>([]);

  function setVal(newValue: string[]) {
    setVal_(newValue);
    props.callback(newValue);
  }

  return (
    <div>
      <Autocomplete
        multiple
        id="tags-standard"
        freeSolo={false}
        filterSelectedOptions
        options={props.options}
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
          <TextField {...params} variant="standard" placeholder={props.placeholder} margin="normal" fullWidth />
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
  initiative?: string[];
  keywords?: string[];
}

type Tagesordnung = {
  [key: string]: string[];
};

function GesetzCard(gesetz: Gesetz) {
  return (
    <Card sx={{ minWidth: 275, maxWidth: 500, m: 2 }}>
      <CardContent>
        {gesetz.titel}
        <Divider sx={{ m: 1 }} />
      {gesetz.sachgebiet?.map(sachgebiet => 
        <Chip key={sachgebiet} label={sachgebiet} />
      )}
      <Divider sx={{ m: 1 }} />
      {gesetz.initiative?.map(party =>
        <Chip key={party} label={party}  variant="outlined"/>
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
  initiators: string[];
  sachgebiete: string[];
  keywords: string[];
}

interface TagesordnungProps {
  tagesordnung: Tagesordnung;
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

function KanbanBoard({gesetze, initiators, sachgebiete, keywords}: KanbanBoardProps) {
  const gesetzeOpen = useMemo<Gesetz[]>(() => gesetze.filter(it => beratungsstand_runnng.includes(it.beratungsstand)), [gesetze])
  const [gesetzeFilterSachgebiet, setGesetzeFilterSachgebiet] = useState<string[]>([])
  const [gesetzeFilterTitle, setGesetzeFilterTitle] = useState<string>("")
  const [gesetzeFilterInitiative, setGesetzeFilterInitiative] = useState<string[]>([])
  const [gesetzeFilterKeyword, setGesetzeFilterKeyword] = useState<string[]>([]);

  const [filterTitleActive, setFilterTitleActive] = useState<boolean>(false);
  const [filterSachgebietActive, setFilterSachgebietActive] = useState<boolean>(false);
  const [filterInitiativeActive, setFilterInitiativeActive] = useState<boolean>(false);
  const [filterKeywordActive, setFilterKeywordActive] = useState<boolean>(false);

  const [gesetzeView, setGesetzeView] = useState<Gesetz[]>([])

  const applyFilter = (sachegebiete: string[], initiators: string[], title: string, keywordsFilter: string[], sachgebietActive: boolean, initiatorsActive: boolean, titleActive: boolean, keywordsActive: boolean) => {
    let gesetze = gesetzeOpen;
    if (titleActive) {
      gesetze = gesetze.filter((it) => it.titel.indexOf(title) >= 0);
    }
    if (sachgebietActive) {
      gesetze = gesetze.filter((it) => it.sachgebiet?.some((s) => sachegebiete.includes(s)))
    }
    if (initiatorsActive) {
      gesetze = gesetze.filter((it) => it.initiative?.some((s) => initiators.includes(s)))
    }
    if (keywordsActive) {
      gesetze = gesetze.filter((it) => it.keywords?.some((s) => keywordsFilter.includes(s)))
    }
    setGesetzeView(gesetze)
  }

  useEffect(() => {gesetzeView.length === 0 && applyFilter(gesetzeFilterSachgebiet, gesetzeFilterInitiative, gesetzeFilterTitle, gesetzeFilterKeyword, filterSachgebietActive, filterInitiativeActive, filterTitleActive, filterKeywordActive)})

  const colSize = 400;

  const handleFilterSachgebiet = (sachgebiete: string[]) => {
    const sachgebietActive: boolean = sachgebiete.length > 0;
    setFilterSachgebietActive(sachgebietActive);
    setGesetzeFilterSachgebiet(sachgebiete)
    applyFilter(sachgebiete, gesetzeFilterInitiative, gesetzeFilterTitle, gesetzeFilterKeyword, sachgebietActive, filterInitiativeActive, filterTitleActive, filterKeywordActive)
  }

  const handleFilterTitle = (title: string) => {
    const titleActive: boolean = title.length > 0;
    setFilterTitleActive(titleActive)
    setGesetzeFilterTitle(title)
    applyFilter(gesetzeFilterSachgebiet, gesetzeFilterInitiative, title, gesetzeFilterKeyword, filterSachgebietActive, filterInitiativeActive, titleActive, filterKeywordActive)
  }

  const handleFilterInitiative = (initiators: string[]) => {
    const initiatorsActive: boolean = initiators.length > 0
    setFilterInitiativeActive(initiatorsActive);
    setGesetzeFilterInitiative(initiators)
    applyFilter(gesetzeFilterSachgebiet, initiators, gesetzeFilterTitle, gesetzeFilterKeyword, filterSachgebietActive, initiatorsActive, filterTitleActive, filterKeywordActive)
  }

  const handleFilterKeyword = (keywords: string[]) => {
    const keywordsActive: boolean = keywords.length > 0
    setFilterKeywordActive(keywordsActive);
    setGesetzeFilterKeyword(keywords)
    applyFilter(gesetzeFilterSachgebiet, gesetzeFilterInitiative, gesetzeFilterTitle, keywords, filterSachgebietActive, filterInitiativeActive, filterTitleActive, keywordsActive)
  }

  return (
    <>
    <h2>Kanban Board - Offene Gesetzesvorhaben</h2>
    <Paper sx={{ p: 1 }}>
    <b>Filter</b>
    <Grid container spacing={2}>
      <Grid item={true} xs={7}>
        <FilterWidget options={sachgebiete} callback={handleFilterSachgebiet} placeholder='Sachgebiet' />
      </Grid>
      <Grid item={true} xs={5}>
        <FilterWidget options={initiators} callback={handleFilterInitiative} placeholder='Initiator' />
      </Grid>
    </Grid>
    <Grid container spacing={2}>
      <Grid item={true} xs={7}>
        <FilterWidget options={keywords} callback={handleFilterKeyword} placeholder='Keywords' />
      </Grid>
      <Grid item={true} xs={5}>
        <TextField fullWidth={true} id="standard-basic" label="Title" variant="standard" onChange={(e) => {handleFilterTitle(e.target.value)}} />
      </Grid>
    </Grid>
    </Paper>
    <Box sx={{ m: 1 }} />
    <Grid container spacing={2} sx={{ width: colSize*12 }}>
    {
    beratungsstand_runnng.map(it => (
      <Grid sx={{ width: colSize }} item={true} xs={1} key={it}><b>{it} ({gesetzeView.filter(g => g.beratungsstand === it).length})</b></Grid>
    ))
    }
    {
    beratungsstand_runnng.map(it => {
      const data = gesetzeView.filter(g => g.beratungsstand === it)
      return <Grid sx={{ width: colSize }} item={true} xs={1} key={it}>
        {data.map(g => <GesetzCard key={g.id} {...g} />)}
        </Grid>
    })
    }
    </Grid>
    </>
  )
}

function Statistics({gesetze, initiators, sachgebiete}: KanbanBoardProps) {
  const [value, setValue] = useState('published');
  const bins = [7, 14, 30, 60, 120, 240, 365];
  const bins_label = [...bins, '>365']
  const gesetze_filtered = useMemo<Gesetz[]>(() => {
    if (value === 'published') {
      return gesetze.filter(g => g.beratungsstand == 'Verkündet')
    } else if (value === 'running') {
      return gesetze.filter(it => beratungsstand_runnng.includes(it.beratungsstand))
    } else if (value === 'rejected') {
      return gesetze.filter(it => it.beratungsstand === 'Abgelehnt')
    } else if (value === 'incompatible') {
      return gesetze.filter(it => it.beratungsstand === 'Für mit dem Grundgesetz unvereinbar erklärt')
    }
    return gesetze
  }, [value, gesetze])

  const gesetze_bt = useMemo<Gesetz[]>(() => gesetze_filtered.filter(g => g.zustimmungsbeduerftigkeit.filter(z => z.startsWith('Ja')).length === 0), [gesetze_filtered])
  const gesetze_br = useMemo<Gesetz[]>(() => gesetze_filtered.filter(g => g.zustimmungsbeduerftigkeit.filter(z => z.startsWith('Ja')).length !== 0), [gesetze_filtered])
  const bin = d3.bin<Gesetz, number>().domain([0, 9999]).thresholds(bins.map(v => v+1)).value(d => d.vorgangsdauer)
  const hist_bt = useMemo<d3.Bin<Gesetz, number>[]>(() => bin(gesetze_bt), [bin, gesetze_bt])
  const hist_br = useMemo<d3.Bin<Gesetz, number>[]>(() => bin(gesetze_br), [bin, gesetze_br])
  const hist = useMemo<d3.Bin<Gesetz, number>[]>(() => bin(gesetze_filtered), [bin, gesetze_filtered])

  const initiator_hist = useMemo<object>(() =>  Object.fromEntries(initiators.map((it) => [it,  gesetze_filtered.filter((g) => g.initiative?.includes(it)).length])), [gesetze_filtered, initiators])
  const sachgebiete_hist = useMemo<object>(() =>  Object.fromEntries(sachgebiete.map((it) => [it,  gesetze_filtered.filter((g) => g.sachgebiet?.includes(it)).length])), [gesetze_filtered, sachgebiete])

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
        <FormControlLabel value="rejected" control={<Radio />} label="Abgelehnt" />
        <FormControlLabel value="incompatible" control={<Radio />} label="Unvereinbar mit Grundgesetz" />
      </RadioGroup>
    </FormControl>

    <h3>Anzahl Gesetzesvorhaben nach Vorgangsdauer</h3>
    <BarChart
      width={700}
      height={500}
      series={[
        { data: hist_bt.map(b => b.length), label: 'Gesetze Bundestag', id: 'bt' },
        { data: hist_br.map(b => b.length), label: 'Gesetze Bundestag+Bundesrat', id: 'br' }
      ]}
      xAxis={[{ scaleType: 'band', data: bins_label, id: 'vorgang-duration', label: 'Vorgang Dauer in Tagen' }]}

    />

    <h3>Gesetzesvorhaben nach Vorgangsdauer</h3>
    {
      hist.map((gesetze, idx) => (
      <Accordion key={"Accordion-"+bins[idx]}>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Vorgang Dauer {bins_label[idx]} Tage ({gesetze.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
        {gesetze.map(g => <GesetzCard key={g.id} {...g} />)}
        </AccordionDetails>
      </Accordion>
      ))
    }

    <h3>Initiator</h3>
    {
      Object.keys(initiator_hist).length > 0 && <BarChart
      width={900}
      height={600}
      margin={{ top: 50, right: 30, left: 250, bottom: 20 }}
      series={[
        { data: Object.values(initiator_hist), label: 'Anzahl Gesetze mit Initiator (mehrfachnennung möglich)', id: 'bt' },
      ]}
      yAxis={[{ scaleType: 'band', data: Object.keys(initiator_hist), id: 'anzahl-gesetze' }]}

      layout="horizontal"
    />
  }
    
    <h3>Sachgebiete</h3>
    {
      Object.keys(sachgebiete_hist).length > 0 && <BarChart
      width={1200}
      height={700}
      margin={{ top: 50, right: 30, left: 350, bottom: 20 }}
      series={[
        { data: Object.values(sachgebiete_hist), label: 'Anzahl Gesetze mit Sachgebiet (mehrfachnennung möglich)', id: 'bt' },
      ]}
      yAxis={[{ scaleType: 'band', data: Object.keys(sachgebiete_hist), id: 'anzahl-gesetze' }]}

      layout="horizontal"
    />
    }
    </>
  )
}

function Tagesordnung({gesetze, tagesordnung}: TagesordnungProps) {
  return (
    <>
    <h2>Gesetzesentwürfe in der Tagesordnung des Deutschen Bundestags</h2>
    {
      Object.keys(tagesordnung).map((day, idx) => (
        <Accordion key={"Accordion-"+idx}>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
        <Typography>{day} ({tagesordnung[day].length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
        {gesetze.filter((gesetz) => tagesordnung[day].includes(gesetz.id)).map(g => <GesetzCard key={g.id} {...g} />)}
        </AccordionDetails>
        </Accordion>
      ))
    }
    </>
  )
}

function App() {
  const [gesetze, setGesetze] = useState<Gesetz[]>([])
  const [tagesordnung, setTagesordnung] = useState<Tagesordnung>({})

  useEffect(() => {
    fetch('gesetze.json')
    .then(response => response.json())
    .then(data => setGesetze(data))
  }, [setGesetze])

  useEffect(() => {
    fetch('tagesordnung.json')
    .then(response => response.json())
    .then(data => setTagesordnung(data))
  }, [setTagesordnung])

  const sachgebiete = useMemo<string[]>(() => [... d3.sort(new Set(gesetze.flatMap((it) => it.sachgebiet || [])))], [gesetze]);
  const initiators = useMemo<string[]>(() => [... d3.sort(new Set(gesetze.flatMap((it) => it.initiative || [])))], [gesetze]);
  const keywords = useMemo<string[]>(() => [... d3.sort(new Set(gesetze.flatMap((it) => it.keywords || [])))], [gesetze]);
  const initators_fraktion = useMemo<string[]>(() => initiators.filter((it) => it.startsWith('Fraktion')), [initiators])
  const initators_ausschuss = useMemo<string[]>(() => initiators.filter((it) => it.includes('usschuss')), [initiators])
  const initiator_land = useMemo<string[]>(() => (initiators.filter((it) => initators_fraktion.indexOf(it) < 0 && initators_ausschuss.indexOf(it) < 0 && it !== 'Bundesregierung')), [initiators, initators_fraktion, initators_ausschuss])
  const initiator_sort = useMemo<string[]>(() => ['Bundesregierung', ...initators_fraktion, ...initiator_land, ...initators_ausschuss], [initators_fraktion, initiator_land, initators_ausschuss])

  return (
    <>
    <div id='headline'>
    <h1>Überblick zu Gesetzesvorhaben der Deutschen Bundesregierung in der 20. Wahlperiode</h1>
    <h3>Disclaimer: Diese Seite befindet sich noch im Aufbau und kann falsche oder unvollständige Informationen beinhalten.</h3>
    <p>Quelle: <a href="https://dip.bundestag.de">https://dip.bundestag.de/</a>, <a href="https://search.dip.bundestag.de/api/v1/swagger-ui/#">https://search.dip.bundestag.de/api/v1/swagger-ui/#</a>, <a href="https://www.bundestag.de/tagesordnung">https://www.bundestag.de/tagesordnung</a></p>
    <p>Stand: {(new Date(__BUILD_DATE__)).toLocaleDateString('de-DE')}</p>
    <p>Fork me on GitHub: <a href="https://github.com/peckto/gesetze-im-de-bundestag">https://github.com/peckto/gesetze-im-de-bundestag</a></p>
    <Divider />
    </div>
    <br />
    
    <Tagesordnung gesetze={gesetze} tagesordnung={tagesordnung} />
    <Divider sx={{ m: 10 }} />
    <Statistics gesetze={gesetze} initiators={initiator_sort} sachgebiete={sachgebiete} keywords={keywords} />
    <Divider sx={{ m: 10 }} />
    <KanbanBoard gesetze={gesetze} initiators={initiator_sort} sachgebiete={sachgebiete} keywords={keywords} />
    </>
  )
}

export default App
