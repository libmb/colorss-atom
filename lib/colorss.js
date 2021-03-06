'use babel';

import ColorssView from './colorss-view';
import {
    CompositeDisposable
} from 'atom';

export default {

    colorssView: null,
    modalPanel: null,
    subscriptions: null,

    activate(state) {
        this.colorssView = new ColorssView(state.colorssViewState);
        this.modalPanel = atom.workspace.addModalPanel({
            item: this.colorssView.getElement(),
            visible: false
        });

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'colorss:toggle': () => this.toggle()
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'colorss:run': () => this.run()
        }));
    },

    deactivate() {
        this.modalPanel.destroy();
        this.subscriptions.dispose();
        this.colorssView.destroy();
    },

    serialize() {
        return {
            colorssViewState: this.colorssView.serialize()
        };
    },

    run() {
        const editor = atom.workspace.getActiveTextEditor()
        if (this.gutter) {
            this.gutter.destroy()
        }
        this.gutter = editor.addGutter({
            name: "ColorSS-Gutter"
        })

        // TODO: make sure gutter is destroyed when editor is destroyed

        //console.log(editor)
        const buffer = editor.getBuffer()
        const lines = buffer.getLines()
        //console.log(lines)
        const colorLocations = this.findColors(lines)
        this.markColors(colorLocations, editor)
    },

    findColors(lines) {
        // TODO: really find the colors
        const result = []
        for (var i = 0; i < lines.length; i++) {
          console.log("i: " +i)
            if (lines[i].includes('color')) {
              var colorString = ""
              for (var j = 0; j < lines[i].length; j++){
                console.log("j: " +j)
                if (lines[i][j] === ":") {
                  let start = j + 2
                  colorString = lines[i].substring(start, lines[i].length-1)
                  console.log("colorString: " +colorString)
                }
                result.push({
                    line: i + 1,
                    color: colorString      
                })
              }
            }
        }
        return result
    },

    markColors(colorLocations, editor) {
        let layer = editor.getDefaultMarkerLayer()
        for (let i = 0; i < colorLocations.length; i++) {
            const loc = colorLocations[i]
            // create marker (on line loc.line)
            const marker = editor.markBufferRange([
                [loc.line - 1, 0],
                [loc.line - 1, 0]
            ])
            const myDiv = document.createElement('div')
            myDiv.classList.add('colorss-linemarker')
            myDiv.style.backgroundColor = loc.color
            const decoration = this.gutter.decorateMarker(marker, {
                type: 'gutter',
                item: myDiv
            })
        }
    },

    toggle() {
        console.log('Colorss was really toggled!');
        return (
            this.modalPanel.isVisible() ?
            this.modalPanel.hide() :
            this.modalPanel.show()
        );
    }

};
