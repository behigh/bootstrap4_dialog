Bootstrap4 modal enhancement
===============================

This library allows you to create modal windows programmatically without using HTML markup. 
It is also possible to create windows one on top of the other.

Simpe usage:
```javascript
import Dialog from 'bootstrap4_dialog/src/dialog'

Dialog('my content') // can HTML markup, DOM element, jQuery collection
```

Advanced usage:
```javascript
import Dialog from 'bootstrap4_dialog/src/dialog'

let mainDialog = Dialog({
    message: myContent, // can: text, HTML markup, DOM element, jQuery collection
    title: myTitle,
    size: 'md', // can: xl, lg, md, sm,
    classes: '', // Extra classes for modal
    dialogClasses: '', // Extra classes for dialog
    close: true, // Show close button,
    show: true, // Show after initialization
    buttons: [ // default null
        {
            text: 'Close',
            action: 'close' // can: submit|reset (submit or reset a form from dialog)
        },
        {
            text: 'Alert',
            action: (e) => {
                Dialog.alert('Dialog over dialog.')
            }
        },
        {
            text: 'Confirm',
            action: (e) => {
                Dialog.confirm('Are you sure?', (assert) => {
                    if (assert) {
                        mainDialog.hide()
                    }
                })
            }
        }
    ]
    
}) 
```
