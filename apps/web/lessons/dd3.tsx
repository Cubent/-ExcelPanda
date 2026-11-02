// Data & Dashboards, unit 3: the data model and DAX.
import { MODEL, MODEL_REL, MODEL_TABLES, REL_DATE, REL_PRODUCT, approx, mCell, mReport, mRels, mUses, mVal } from './dd-util';
import { custom, info } from './dsl';
import type { LessonContent, LessonStep, ModelConfig, StepCtx } from './types';

const REVENUE = { Revenue: 'SUMX(Sales, Sales[Units] * Sales[Price])' };
const withMeasures = (m: Record<string, string>, rel = true): ModelConfig => ({ ...(rel ? MODEL_REL : MODEL), measures: m });
const has = (c: StepCtx, from: string, to: string) => mRels(c).some((r) => r.from === from && r.to === to);

type M = NonNullable<NonNullable<LessonStep['solution']>['model']>;
const mstep = (o: { id: string; title: string; body: React.ReactNode; hint?: string; success?: string; model?: ModelConfig; resetPanels?: boolean; check: (c: StepCtx) => boolean; sol: M }) =>
  custom({ ...o, view: 'model', sol: { model: o.sol, view: 'model' } });

// ---------------------------------------------------------------------------
export const modelRel: LessonContent = {
  key: 'dd-model-rel',
  title: 'Tables & relationships',
  sheet: { cols: 12, rows: 30 },
  model: { ...MODEL, allow: { relationships: true, measures: false, report: false } },
  steps: [
    info('intro', 'Stop merging everything into one giant table', (
      <>
        <p>
          A <strong>data model</strong> keeps tables separate and links them with <strong>relationships</strong>. <strong>Sales</strong> is the <em>fact</em> table (one row per sale). <strong>Products</strong> and{' '}
          <strong>Calendar</strong> are <em>lookup</em> tables (one row per product, one per month). This layout is called a <strong>star schema</strong>.
        </p>
        <p>
          A relationship is <strong>many-to-one</strong>: many sales rows point at one product row. Filters travel from the "one" side to the "many" side.
        </p>
      </>
    )),
    mstep({
      id: 'product', title: 'Link Sales to Products',
      body: <p>In <strong>Relationships</strong>: many side <strong>Sales[ProductID]</strong>, one side <strong>Products[ProductID]</strong>. Press Create relationship.</p>,
      hint: 'The many side is the fact table.',
      success: 'Now a filter on Products reaches Sales.',
      check: (c) => has(c, 'Sales[ProductID]', 'Products[ProductID]'),
      sol: { relationships: [REL_PRODUCT] },
    }),
    mstep({
      id: 'date', title: 'Link Sales to the Calendar',
      body: <p>Do the same for dates: many side <strong>Sales[Date]</strong>, one side <strong>Calendar[Date]</strong>.</p>,
      hint: 'A date table lets you analyse by year and month, and unlocks time intelligence.',
      success: 'Both lookups are connected: a star.',
      check: (c) => has(c, 'Sales[ProductID]', 'Products[ProductID]') && has(c, 'Sales[Date]', 'Calendar[Date]'),
      sol: { relationships: [REL_DATE] },
    }),
  ],
};

// ---------------------------------------------------------------------------
export const modelMeasures: LessonContent = {
  key: 'dd-model-measures',
  title: 'Your first measures',
  sheet: { cols: 12, rows: 30 },
  model: MODEL_REL,
  steps: [
    info('intro', 'A measure is a formula that adapts', (
      <p>
        A <strong>measure</strong> is a DAX formula calculated <em>on demand</em>, for whatever rows and filters the report is showing. Write it once and it works for every product, month and slicer.
      </p>
    )),
    mstep({
      id: 'units', title: 'Total units',
      body: <p>Add a measure named <strong>Units</strong> with <strong>SUM(Sales[Units])</strong>.</p>,
      hint: 'DAX formula: SUM(Sales[Units]).',
      success: '42 units overall.',
      check: (c) => mVal(c, 'Units') === 42 && mUses(c, 'Units', 'SUM'),
      sol: { measures: { Units: 'SUM(Sales[Units])' } },
    }),
    mstep({
      id: 'revenue', title: 'Revenue needs a row-by-row calculation',
      body: (
        <p>
          Revenue is units times price on <em>each row</em>, then added up. That is what <strong>SUMX</strong> does. Add <strong>Revenue</strong> = <strong>SUMX(Sales, Sales[Units] * Sales[Price])</strong>.
        </p>
      ),
      hint: 'SUMX(table, expression).',
      success: '294 in total.',
      check: (c) => mVal(c, 'Revenue') === 294 && mUses(c, 'Revenue', 'SUMX'),
      sol: { measures: REVENUE },
    }),
    mstep({
      id: 'report', title: 'Slice it by category',
      body: <p>In <strong>Report</strong>, set Rows to <strong>Products[Category]</strong> and tick the <strong>Revenue</strong> value. The relationship does the rest.</p>,
      hint: 'Choose Products[Category] in Rows, then click the Revenue button.',
      success: 'Gear 175, Stationery 119. Revenue lives in Sales, but Category lives in Products.',
      check: (c) => mReport(c)?.rowField === 'Products[Category]' && mCell(c, 'Gear', 'Revenue') === 175 && mCell(c, 'Stationery', 'Revenue') === 119,
      sol: { report: { rowField: 'Products[Category]', measures: ['Revenue'] } },
    }),
  ],
};

// ---------------------------------------------------------------------------
export const modelCalculate: LessonContent = {
  key: 'dd-model-calculate',
  title: 'CALCULATE',
  sheet: { cols: 12, rows: 30 },
  model: withMeasures(REVENUE),
  steps: [
    info('intro', 'The most important function in DAX', (
      <p>
        <strong>CALCULATE(measure, filter, …)</strong> evaluates a measure after changing the filters. It is how you write "revenue for pens only" or "revenue ignoring the slicer".
      </p>
    )),
    mstep({
      id: 'pen', title: 'Revenue for one product',
      body: <p>Add <strong>Pen Revenue</strong> = <strong>CALCULATE([Revenue], Products[Name] = "Pen")</strong>.</p>,
      hint: 'A measure is referred to by its name in square brackets.',
      success: '56.',
      check: (c) => mVal(c, 'Pen Revenue') === 56 && mUses(c, 'Pen Revenue', 'CALCULATE'),
      sol: { measures: { 'Pen Revenue': 'CALCULATE([Revenue], Products[Name] = "Pen")' } },
    }),
    mstep({
      id: 'all', title: 'Remove filters with ALL',
      body: <p>Add <strong>All Revenue</strong> = <strong>CALCULATE([Revenue], ALL(Products))</strong>. It ignores any filter on Products.</p>,
      hint: 'ALL(table) clears filters on that table.',
      success: 'Always 294, however the report is filtered.',
      check: (c) => mVal(c, 'All Revenue', { 'Products[Category]': ['Gear'] }) === 294 && mUses(c, 'All Revenue', 'CALCULATE', 'ALL'),
      sol: { measures: { 'All Revenue': 'CALCULATE([Revenue], ALL(Products))' } },
    }),
    mstep({
      id: 'share', title: 'Share of total',
      body: <p>Add <strong>Share</strong> = <strong>DIVIDE([Revenue], [All Revenue])</strong>. DIVIDE returns blank instead of an error when the denominator is zero.</p>,
      hint: 'DIVIDE(numerator, denominator).',
      success: 'Gear holds about 59.5% of revenue.',
      check: (c) => approx(mVal(c, 'Share', { 'Products[Category]': ['Gear'] }), 175 / 294) && mUses(c, 'Share', 'DIVIDE'),
      sol: { measures: { 'All Revenue': 'CALCULATE([Revenue], ALL(Products))', Share: 'DIVIDE([Revenue], [All Revenue])' } },
    }),
    mstep({
      id: 'report', title: 'Put them in a report',
      body: <p>Rows: <strong>Products[Category]</strong>. Values: <strong>Revenue</strong> and <strong>Share</strong>.</p>,
      hint: 'Click both value buttons.',
      success: 'A percentage-of-total report, with no helper cells.',
      check: (c) => mReport(c)?.rowField === 'Products[Category]' && approx(mCell(c, 'Gear', 'Share'), 175 / 294) && approx(mCell(c, 'Stationery', 'Share'), 119 / 294),
      sol: { report: { rowField: 'Products[Category]', measures: ['Revenue', 'Share'] } },
    }),
  ],
};

// ---------------------------------------------------------------------------
export const modelContext: LessonContent = {
  key: 'dd-model-context',
  title: 'Filter context',
  sheet: { cols: 12, rows: 30 },
  model: withMeasures({ ...REVENUE, 'All Revenue': 'CALCULATE([Revenue], ALL(Products))', 'Pen Revenue': 'CALCULATE([Revenue], Products[Name] = "Pen")' }),
  steps: [
    info('intro', 'The same measure, a different answer', (
      <p>
        Every cell of a report has its own <strong>filter context</strong>: the row, the column, and any slicer. A measure is recalculated inside each one. Understanding this is what makes DAX click.
      </p>
    )),
    mstep({
      id: 'rows', title: 'Revenue changes with the row',
      body: <p>Show <strong>Products[Name]</strong> in Rows with the <strong>Revenue</strong> value.</p>,
      hint: 'Rows: Products[Name]. Values: Revenue.',
      success: 'The same measure gives 56, 63 and 175: one filter context per row.',
      check: (c) => mReport(c)?.rowField === 'Products[Name]' && mCell(c, 'Pen', 'Revenue') === 56 && mCell(c, 'Bag', 'Revenue') === 175,
      sol: { report: { rowField: 'Products[Name]', measures: ['Revenue'] } },
    }),
    mstep({
      id: 'slicer', title: 'A slicer filters everything',
      body: <p>Add the value <strong>All Revenue</strong>, choose <strong>Slicer on Products[Category]</strong> and click <strong>Stationery</strong>. Which numbers moved, and which did not?</p>,
      hint: 'Pick the slicer field, then click the Stationery button.',
      success: 'Revenue followed the slicer (Bag is gone), but All Revenue stayed at 294. ALL tells CALCULATE to ignore it.',
      check: (c) => mReport(c)?.filters['Products[Category]']?.join() === 'Stationery' && mCell(c, 'Pen', 'All Revenue') === 294 && mCell(c, 'Pen', 'Revenue') === 56,
      sol: { report: { rowField: 'Products[Name]', measures: ['Revenue', 'All Revenue'], filters: { 'Products[Category]': ['Stationery'] } } },
    }),
    mstep({
      id: 'override', title: 'CALCULATE overrides a column filter',
      body: <p>With the slicer still on Stationery, add <strong>Pen Revenue</strong> to the values and read the Book row.</p>,
      hint: 'Click the Pen Revenue value button.',
      success: 'Even on the Book row, Pen Revenue is 56. The filter inside CALCULATE replaced the row\'s filter on Name.',
      check: (c) => mReport(c)?.measures.includes('Pen Revenue') === true && mCell(c, 'Book', 'Pen Revenue') === 56 && mReport(c)?.filters['Products[Category]']?.join() === 'Stationery',
      sol: { report: { rowField: 'Products[Name]', measures: ['Revenue', 'All Revenue', 'Pen Revenue'], filters: { 'Products[Category]': ['Stationery'] } } },
    }),
  ],
};

// ---------------------------------------------------------------------------
export const modelTime: LessonContent = {
  key: 'dd-model-time',
  title: 'Time intelligence',
  sheet: { cols: 12, rows: 30 },
  model: withMeasures(REVENUE),
  steps: [
    info('intro', 'Last year, year to date, growth', (
      <>
        <p>
          Time intelligence functions need a proper <strong>date table</strong>: one row per date, no gaps, linked to the fact table. Here the Calendar has one row per month for 2025 and 2026.
        </p>
        <p>
          <strong>SAMEPERIODLASTYEAR</strong> shifts the dates back a year. <strong>TOTALYTD</strong> adds up from January 1 to the current date.
        </p>
      </>
    )),
    mstep({
      id: 'ly', title: 'Revenue last year',
      body: <p>Add <strong>Rev LY</strong> = <strong>CALCULATE([Revenue], SAMEPERIODLASTYEAR(Calendar[Date]))</strong>.</p>,
      hint: 'Wrap the Calendar[Date] column in SAMEPERIODLASTYEAR.',
      success: 'For January 2026 it returns January 2025: 20.',
      check: (c) => mVal(c, 'Rev LY', { 'Calendar[Year]': ['2026'], 'Calendar[Month]': ['1'] }) === 20 && mUses(c, 'Rev LY', 'SAMEPERIODLASTYEAR'),
      sol: { measures: { 'Rev LY': 'CALCULATE([Revenue], SAMEPERIODLASTYEAR(Calendar[Date]))' } },
    }),
    mstep({
      id: 'ytd', title: 'Year to date',
      body: <p>Add <strong>Rev YTD</strong> = <strong>TOTALYTD([Revenue], Calendar[Date])</strong>.</p>,
      hint: 'TOTALYTD(measure, date column).',
      success: 'By March 2026 you have earned 226 this year.',
      check: (c) => mVal(c, 'Rev YTD', { 'Calendar[Year]': ['2026'], 'Calendar[Month]': ['3'] }) === 226 && mUses(c, 'Rev YTD', 'TOTALYTD'),
      sol: { measures: { 'Rev YTD': 'TOTALYTD([Revenue], Calendar[Date])' } },
    }),
    mstep({
      id: 'yoy', title: 'Growth versus last year',
      body: <p>Add <strong>YoY</strong> = <strong>DIVIDE([Revenue] - [Rev LY], [Rev LY])</strong>.</p>,
      hint: 'Revenue minus last year, over last year.',
      success: 'March 2026 (77) against March 2025 (12) is +542%.',
      check: (c) => approx(mVal(c, 'YoY', { 'Calendar[Year]': ['2026'], 'Calendar[Month]': ['3'] }), 65 / 12) && mUses(c, 'YoY', 'DIVIDE'),
      sol: { measures: { 'Rev LY': 'CALCULATE([Revenue], SAMEPERIODLASTYEAR(Calendar[Date]))', YoY: 'DIVIDE([Revenue] - [Rev LY], [Rev LY])' } },
    }),
    mstep({
      id: 'report', title: 'A monthly report',
      body: <p>Slice by <strong>Calendar[Year] = 2026</strong>, with rows <strong>Calendar[Month]</strong> and values <strong>Revenue</strong>, <strong>Rev LY</strong> and <strong>Rev YTD</strong>.</p>,
      hint: 'Slicer on Calendar[Year], click 2026. Then pick rows and the three values.',
      success: 'This year, last year and the running total side by side.',
      check: (c) => mReport(c)?.filters['Calendar[Year]']?.join() === '2026' && mCell(c, '1', 'Rev LY') === 20 && mCell(c, '3', 'Rev YTD') === 226,
      sol: { report: { rowField: 'Calendar[Month]', measures: ['Revenue', 'Rev LY', 'Rev YTD'], filters: { 'Calendar[Year]': ['2026'] } } },
    }),
  ],
};

// ---------------------------------------------------------------------------
export const modelIterators: LessonContent = {
  key: 'dd-model-iterators',
  title: 'Row context, RELATED & VAR',
  sheet: { cols: 12, rows: 30 },
  model: withMeasures(REVENUE),
  steps: [
    info('intro', 'Going row by row', (
      <p>
        Functions ending in <strong>X</strong> (SUMX, AVERAGEX, MAXX) <em>iterate</em>: they visit each row of a table and evaluate an expression there. Inside, <strong>RELATED</strong> reaches across a relationship
        to fetch a value from the "one" side, like a lookup. <strong>VAR</strong> stores an intermediate result with a name.
      </p>
    )),
    mstep({
      id: 'related', title: 'RELATED inside an iterator',
      body: <p>Add <strong>Stationery Units</strong> = <strong>SUMX(FILTER(Sales, RELATED(Products[Category]) = "Stationery"), Sales[Units])</strong>.</p>,
      hint: 'FILTER keeps the sales rows whose product is Stationery. SUMX adds their Units.',
      success: '35 units.',
      check: (c) => mVal(c, 'Stationery Units') === 35 && mUses(c, 'Stationery Units', 'SUMX', 'RELATED'),
      sol: { measures: { 'Stationery Units': 'SUMX(FILTER(Sales, RELATED(Products[Category]) = "Stationery"), Sales[Units])' } },
    }),
    mstep({
      id: 'distinct', title: 'Count different products',
      body: <p>Add <strong>Products Sold</strong> = <strong>DISTINCTCOUNT(Sales[ProductID])</strong>.</p>,
      hint: 'DISTINCTCOUNT counts unique values.',
      success: '3.',
      check: (c) => mVal(c, 'Products Sold') === 3 && mUses(c, 'Products Sold', 'DISTINCTCOUNT'),
      sol: { measures: { 'Products Sold': 'DISTINCTCOUNT(Sales[ProductID])' } },
    }),
    mstep({
      id: 'var', title: 'Name your steps with VAR',
      body: (
        <p>
          Add <strong>Margin</strong> assuming costs are 60% of revenue: <strong>VAR r = [Revenue] RETURN r - r * 0.6</strong>.
        </p>
      ),
      hint: 'VAR name = expression, then RETURN the result.',
      success: '117.6.',
      check: (c) => approx(mVal(c, 'Margin'), 117.6) && /\bVAR\b/i.test(c.model?.model.measures.Margin ?? ''),
      sol: { measures: { Margin: 'VAR r = [Revenue] RETURN r - r * 0.6' } },
    }),
    mstep({
      id: 'if', title: 'Label with IF',
      body: <p>Add <strong>Level</strong> = <strong>IF([Revenue] &gt; 100, "High", "Low")</strong> and show it by <strong>Products[Name]</strong>.</p>,
      hint: 'Rows: Products[Name]; values: Level.',
      success: 'Pen is Low, Book is Low, Bag is High. Text measures work too.',
      check: (c) => mCell(c, 'Bag', 'Level') === 'High' && mCell(c, 'Pen', 'Level') === 'Low',
      sol: { measures: { Level: 'IF([Revenue] > 100, "High", "Low")' }, report: { rowField: 'Products[Name]', measures: ['Level'] } },
    }),
  ],
};

// ---------------------------------------------------------------------------
export const modelTest: LessonContent = {
  key: 'dd-model-test',
  title: 'Unit test: data model',
  sheet: { cols: 12, rows: 30 },
  model: { tables: MODEL_TABLES },
  steps: [
    info('intro', 'Model, measure, report', (
      <p>Start from three unlinked tables and finish with a category report that shows revenue and share of total.</p>
    )),
    mstep({
      id: 'rel', title: '1. Link Sales to Products',
      body: <p>Create the relationship <strong>Sales[ProductID]</strong> (many) to <strong>Products[ProductID]</strong> (one).</p>,
      hint: 'Fact table on the many side.',
      success: 'Connected.',
      check: (c) => has(c, 'Sales[ProductID]', 'Products[ProductID]'),
      sol: { relationships: [REL_PRODUCT] },
    }),
    mstep({
      id: 'rev', title: '2. Revenue',
      body: <p>Add the measure <strong>Revenue</strong> using SUMX over units times price.</p>,
      hint: 'SUMX(Sales, Sales[Units] * Sales[Price]).',
      success: '294.',
      check: (c) => mVal(c, 'Revenue') === 294,
      sol: { measures: REVENUE },
    }),
    mstep({
      id: 'share', title: '3. Share of total',
      body: <p>Add <strong>Share</strong>: revenue divided by revenue with <strong>ALL(Products)</strong>. Use CALCULATE and DIVIDE.</p>,
      hint: 'DIVIDE([Revenue], CALCULATE([Revenue], ALL(Products))).',
      success: 'Gear 59.5%.',
      check: (c) => approx(mVal(c, 'Share', { 'Products[Category]': ['Gear'] }), 175 / 294) && mUses(c, 'Share', 'CALCULATE', 'ALL', 'DIVIDE'),
      sol: { measures: { Share: 'DIVIDE([Revenue], CALCULATE([Revenue], ALL(Products)))' } },
    }),
    mstep({
      id: 'report', title: '4. The report',
      body: <p>Rows <strong>Products[Category]</strong>, values <strong>Revenue</strong> and <strong>Share</strong>.</p>,
      hint: 'Pick the field, then both value buttons.',
      success: 'Unit complete.',
      check: (c) => mReport(c)?.rowField === 'Products[Category]' && mCell(c, 'Gear', 'Revenue') === 175 && approx(mCell(c, 'Gear', 'Share'), 175 / 294),
      sol: { report: { rowField: 'Products[Category]', measures: ['Revenue', 'Share'] } },
    }),
  ],
};

export const DD3 = [modelRel, modelMeasures, modelCalculate, modelContext, modelTime, modelIterators, modelTest];
