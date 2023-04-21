#!/usr/bin/env node

var ffmpeg = require('fluent-ffmpeg')
var nsg = require('node-sprite-generator')
var Jimp = require('jimp')
var rm = require('rimraf')
var Spinner = require('cli-spinner').Spinner
var { Command } = require('commander')
var os = require('os')
var { name, version } = require('../package.json')

var spinner
var program = new Command()
var startTime = +new Date()
var tmp = os.tmpdir() + '/thumbnails'

function startSpinner(string, step) {
  spinner = new Spinner(`[${step}/3] %s ${string}...`)
  spinner.setSpinnerString('|/-\\')
  spinner.start()
}

program
  .version(`${name} ${version}`)
  .argument('<string>', 'the video file path')
  .option('-o, --output <path>', 'thumbnails path, default: ./thumbnails.jpg', './thumbnails.jpg')
  .option('-q, --quality <n>', 'thumbnails quality, default: 60', '60')
  .option('-c, --count <n>', 'thumbnails count, default: 100', '100')
  // .option('-row, --count <n>', 'thumbnails count, default: 10', '10')
  // .option('-col, --count <n>', 'thumbnails count, default: 10', '10')
  .description('🎉  Generate video thumbnails')
  .action(function (file, { output, quality, count }) {
    startSpinner('Screenshots generating', 1)
    ffmpeg(file)
      .screenshots({
        count: +count,
        folder: tmp,
        filename: 'screenshot%00i.png',
        size: '160x?'
      })
      .on('end', function () {
        spinner.stop(true)
        console.log('[1/3] Screenshots generated!')
        startSpinner('Sprite generating', 2)
        nsg(
          {
            src: [tmp + '/*.png'],
            spritePath: tmp + '/sprite.png',
            stylesheetPath: tmp + '/sprite.css',
            layout: 'horizontal',
            compositor: 'jimp'
          },
          function () {
            spinner.stop(true)
            console.log('[2/3] Sprite generated!')
            startSpinner('Compressing', 3)

            Jimp.read(tmp + '/sprite.png', function (err, jpeg) {
              if (err) throw err
              jpeg.quality(+quality).write(output)
              rm.sync(tmp)
              spinner.stop(true)
              console.log('[3/3] Compressing complete!')
              console.log(`✨  Done in ${(+new Date() - startTime) / 1000}s.`)
            })
          }
        )
      })
  })

program.parse(process.argv)
