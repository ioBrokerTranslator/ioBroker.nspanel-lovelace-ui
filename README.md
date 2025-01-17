![Logo](admin/nspanel-lovelace-ui.png)
# ioBroker.nspanel-lovelace-ui

[![NPM version](https://img.shields.io/npm/v/iobroker.nspanel-lovelace-ui.svg)](https://www.npmjs.com/package/iobroker.nspanel-lovelace-ui)
[![Downloads](https://img.shields.io/npm/dm/iobroker.nspanel-lovelace-ui.svg)](https://www.npmjs.com/package/iobroker.nspanel-lovelace-ui)
![Number of Installations](https://iobroker.live/badges/nspanel-lovelace-ui-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/nspanel-lovelace-ui-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.nspanel-lovelace-ui.png?downloads=true)](https://nodei.co/npm/iobroker.nspanel-lovelace-ui/)

**Tests:** ![Test and Release](https://github.com/ticaki/ioBroker.nspanel-lovelace-ui/workflows/Test%20and%20Release/badge.svg)

## nspanel-lovelace-ui adapter for ioBroker

NsPanel Lovelace UI is a Firmware for the nextion screen inside of NSPanel in the Design of Lovelace UI Design.


Entwickleränderungen / Erklärung

Merkhilfe:
- Das icon.*.value anpassen an das val_min/max verhalten von ion.*.color

Immer wenn ich Zeit und lust habe Dokumentiere ich hier Sachen.

## Eingebaut:
- cardMedia 
- cardGrid/2
- cardEntities
- cardPower
- cardThermo
- screensaver
- cardMedia
- alle Popups und PageItems

## Erklärungen

### Icons:
#### Dateneingang:
Zu Icon.x.color: (nix was mit Licht zu tun hat.)
Eingabe geht über folgende common Eigenschaftenmöglichkeiten
- type: number
  - decimal
- type: string
  - stringify Json: {r:0,g:0,b:0} oder {red:0,green:0,blue:0}
  - hexcolor - 7 Stellen beginned mit #
  - css color names (role: level.color.name) https://www.tutorialrepublic.com/css-reference/css-color-names.php
  - hsl: "hsl(0, 50%, 50%)" (role: level.color.name)

#### Funktion
##### IconEntryType
Sollte alle Icons betreffen abgesehen vom Screensaver zum aktuellen Zeitpunkt.

- true: ist der default wert sollte immer angegeben werden 
- false: optional der Wert für boolean false
- text: optional wird auf einer cardGrid/2 angezeigt anstelle des Icons
- scale: siehe unten

##### IconScaleElement
scale bekommt eine eigenen Punkt: das object besteht aus folgenden typen: `{val_min: number, val_max: number, val_best?: number, log10?: 'max' | 'min';}` um es zu verwenden muß icon.true.color und icon.false.color definiert sein. Value bezeichnet einen Wert der häufig von entity1 kommt.
- wenn nur val_min definiert ist bedeutet val_min >= Value das die Farbe bei true gewählt wird.
- wenn nur val_max definiert ist bedeutet val_max <= Value das die Farbe bei true gewählt wird.
- wenn val_max und val_min definiert sind, wird die Farbe von false (val_min) zu true (val_max) interpoliert
- val_max und val_min werden getauscht, ebenso die Farben für true und false, wenn max < min ist. Falls min und max gleich sind wird die Farbe von true zurückgegeben.
- wenn zusätzlich val_best definiert ist, ist val_best die Farbe von true und wird jeweils in die Richtungen von val_min/max zu false interpoliert
- wenn zusätzlich log10 definiert ist, wird bei `max` ein log10() 1 false, 10 true ausgeführt, bei `min` (10-value) -> 10 false, 1 true. 

### ValueEntryType

besteht aus diesen Typen: `{value: string | number |boolean; decimal?: number;factor?: number; unit?: string; minScale?: number; maxScale?: number; set?: string | number |boolean; } | undefined;` 

Wenn *** verlangert wird
- boolean läd Value und doppelt verneint es.
- number wird als nummer geladen oder konvertiert dann * `factor` und mit `minScale` und `maxScale` auf 0-100 skaliert.
- string wird 
  - mit `type==number` als nummer geladen und `decimal` angewendet 
  - oder als String 
  - `unit` wird in beiden Fällen hinzugefügt.


Beim Schreiben:
- erst wird `set`versucht, wenn negativ dann `value`

Sind natürlich alles Dataitems

### PageItems
#### vormalig CreateEntity()

##### light
- entity1 ist der Schalter
- icon (entity1)
- iconColor: Leuchtmittelfarbe kommt von dem definierten RGB Wert oder von CT (kelvin/mired) oder von IconEntryType entweder  scaliert mit dimmer oder entity1 
- dimmer ist ein Zahlenwert 
- colorMode kann die Eigenschaft undefined | 'hue' | 'ct' haben und bestimmt welcher Modus für das Icon verwendet werden soll.
- headline ist die Item Beschreibung 

##### shutter
- entity1 ist das level muß eine Zahl sein 0-100
- icon & iconColor (IconEntryType)(entity1)
- headline ist die Item Beschreibung  
- valueList ist ein array mit 3 oder 6 Einträgen die die Iconbezeichnung enthält - '' für disable. Felder werden ebenfalls disabled wenn keine Befehlsstate gefunden wird.

##### number
- entity1 ist das level muß eine Zahl sein 0-100
- text.true ist die Bezeichnung
- icon & iconColor wie shutter

##### text
- entity1 kann zahl,boolean sein. Falls es nicht klappt wird von true ausgegangen.
- entity2 oder text1 ist der text rechts in cardEntites
- text.true ist die Bezeichnung
- icon & iconColor wie shutter

##### button
- entity1 bestimmt den button Status oder true
- icon & iconColor wie shutter
- setValue1 schaltet den angegebenen State um (optional)
- setValue2 schaltet den angegebenen State auf false (optional)
- setNavi springt zur angegebenen NavigationsID

##### input_sel
- entityInSel als nummer oder boolean oder undefined
- Icon/Color wie gehabt
- headline ist die Beschreibung
- text ist der text rechts in entities

##### fan
- entity1 ist der Schalter
- icon...
- headline die Beschreibung

##### timer
- im moment nur die interne Version komplett eingebaut
- entity1 noch zu verstreichende Sekunden oder interner Zähler
- icon...
- text alternativer text für die anzeige rechts in entitiys standard ist Zeit.



## Changelog
<!--
    Placeholder for the next version (at the beginning of the line):
    ### **WORK IN PROGRESS**
-->
### 0.0.4-preAlpha.3 (2024-02-20)
- (ticaki) testversion

### 0.0.4-preAlpha.2 (2024-02-12)
- (ticaki) Add button flip to cardThermo

### 0.0.4-preAlpha.1 (2024-02-12)
- (ticaki) cardThermo, script config

### 0.0.4-preAlpha.0 (2024-02-01)
- (ticaki) admin save - still deep alpha

### 0.0.3-preAlpha.0 (2024-02-01)
- (ticaki) alot - still dont install this

### 0.0.2-JustPlaceholder.0 (2024-01-05)
* (ticaki) initial release

## License
MIT License

Copyright (c) 2024 ticaki <github@renopoint.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.