"""Convierte WAKE_UP_Master.xlsx a SpreadsheetML (Excel 2003 XML), un formato
de texto que Google Drive importa como Google Sheet con todas sus pestañas."""

import sys
from xml.sax.saxutils import escape

from openpyxl import load_workbook

sys.path.insert(0, "wakeup")
from build_master_sheet import ESTADO_COLORS, FORMAT_COLORS  # noqa: E402

SRC, OUT = "wakeup/WAKE_UP_Master.xlsx", "wakeup/WAKE_UP_Master.xml"
FILLS = {**FORMAT_COLORS, **ESTADO_COLORS, "ALTA": "FFC9C9", "MEDIA": "FFF3BF", "BAJA": "EEEEEE"}
STYLE_ID = {v: f"c{i}" for i, v in enumerate(FILLS)}

wb = load_workbook(SRC)
out = ['<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>'
       '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" '
       'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" '
       'xmlns:x="urn:schemas-microsoft-com:office:excel"><Styles>'
       '<Style ss:ID="Default"><Alignment ss:Vertical="Top" ss:WrapText="1"/><Font ss:FontName="Arial" ss:Size="10"/></Style>'
       '<Style ss:ID="h"><Alignment ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#111111" ss:Pattern="Solid"/></Style>'
       '<Style ss:ID="t"><Font ss:FontName="Arial" ss:Size="16" ss:Bold="1"/></Style>'
       '<Style ss:ID="i"><Font ss:FontName="Arial" ss:Size="11" ss:Italic="1"/></Style>'
       '<Style ss:ID="k"><Alignment ss:Vertical="Top" ss:WrapText="1"/><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1"/></Style>']
for v, sid in STYLE_ID.items():
    out.append(f'<Style ss:ID="{sid}"><Alignment ss:Vertical="Top" ss:WrapText="1"/><Interior ss:Color="#{FILLS[v]}" ss:Pattern="Solid"/></Style>')
out.append("</Styles>")

for ws in wb:
    if ws.title == "00 LÉEME":
        continue
    readme = ws.title == "00 LÉEME"
    out.append(f'<Worksheet ss:Name="{escape(ws.title)}"><Table>')
    for col in range(1, ws.max_column + 1):
        w = ws.column_dimensions[ws.cell(1, col).column_letter].width or 12
        out.append(f'<Column ss:Width="{round(w * 5.6)}"/>')
    for r in range(1, ws.max_row + 1):
        cells, skipped = [], False
        for c in range(1, ws.max_column + 1):
            v = ws.cell(r, c).value
            if v is None or v == "":
                skipped = True
                continue
            if readme:
                style = {1: "t", 2: "i"}.get(r, "h" if r == 4 else ("k" if c == 1 else None))
            else:
                if ws.title == "06 PRODUCCIÓN" and v == "PENDIENTE":
                    skipped = True
                    continue
                style = "h" if r == 1 else (STYLE_ID.get(v) if isinstance(v, str) and v in FORMAT_COLORS else None)
            attrs = (f' ss:Index="{c}"' if skipped else "") + (f' ss:StyleID="{style}"' if style else "")
            typ = "Number" if isinstance(v, (int, float)) else "String"
            cells.append(f'<Cell{attrs}><Data ss:Type="{typ}">{escape(str(v))}</Data></Cell>')
            skipped = False
        out.append("<Row>" + "".join(cells) + "</Row>")
    out.append("</Table>")
    if not readme:
        out.append('<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><FreezePanes/>'
                   '<FrozenNoSplit/><SplitHorizontal>1</SplitHorizontal><TopRowBottomPane>1</TopRowBottomPane>'
                   '<ActivePane>2</ActivePane></WorksheetOptions>')
    out.append("</Worksheet>")
out.append("</Workbook>")
out = [x.replace(" ss:", " s:").replace("xmlns:ss=", "xmlns:s=") for x in out]

with open(OUT, "w", encoding="utf-8") as f:
    f.write("".join(x for x in out if isinstance(x, str)))
print("OK", OUT)
