const { default: axios } = require('axios');

const moment = require('moment')

var config = require('./config')

const DWArr = ['descubrimiento semanal', 'discover weekly'] 
const RNArr = ['Radar de Novedades', 'News radar'] 

const dwID = config.setup.discoverWeeklyID
const nrID = config.setup.releaseRadarID

const userID = config.setup.userID
const lastUp = moment(new Date()).format("DDMMM")
const mix4SpotPlaylist = {
    name: config.setup.mix4SpotPlaylist.name,
    desc: config.setup.mix4SpotPlaylist.desc + '. Last Update: ' + lastUp
}

exports.test = () => {
    return 'this is a test'
}

exports.runMix4Spot = async (options) => {
    // 1. Buscar DW ID (Provided in config)
        //const dwID = await this.searchDWPLID(options)
        console.log("dwID: " + dwID)
    // 2. Coger los tracks y sus URIS
        const dwTracks = await this.getPlaylistTracks(options, dwID)
        const dwTracksURIS = dwTracks.map((item) => item.track.uri)
    // 3. Buscar NR ID (Provided in config)
        //const nrID = await this.searchNRPLID(options)
        console.log("nrID: " + nrID)
    // 4. Coger los tracks y sus URIS
        const nrTracks = await this.getPlaylistTracks(options, nrID)
        const nrTracksURIS = nrTracks.map((item) => item.track.uri)
        // TODO: UPDATE AN IMAGE
        let myImage = ''
        if(nrTracks[0].track.album.images.length > 0) {
            myImage = nrTracks[0].track.album.images[0].url;
        }
        
    // 5. Mezclar ambos
        const allTracksURIS = nrTracksURIS.concat(dwTracksURIS)
        let allTracksURISString = "?uris="
        allTracksURIS.forEach((uri) => allTracksURISString = allTracksURISString + uri + ',')
        allTracksURISString = allTracksURISString.slice(0,-1)
    // 6. Buscar Nueva Playlist
        // 6a. Si existe vaciarla
        // 6b. Si no, crearla
        const hasMixPL = await this.searchMixPL(options)
        if(!hasMixPL) {
            await this.createMix(options)
        }
    // 7. Añadir todos los URIs
        const updated = await this.updateMix(options, hasMixPL, allTracksURISString)
        return updated
}

exports.searchDWPLID = async (options) => {
    options.url = 'https://api.spotify.com/v1/search?q=discover%20weekly&type=playlist'
    const mydw = await axios(options);
    let myWDPL = mydw.data.playlists.items.find((pl) => DWArr.includes(pl.name.toLowerCase()));
    const id = myWDPL.id
    return id
}

exports.getPlaylistTracks = async (options, id) => {
    options.url = `https://api.spotify.com/v1/playlists/`+id+`/tracks`
    const dwTracks = await axios(options)

    return dwTracks.data.items
}

exports.searchNRPLID = async (options) => {
    options.url = 'https://api.spotify.com/v1/search?q=release%20radar&type=playlist'
    const mynr = await axios(options);
    //let myNRPL = mydw.data.playlists.items.find((pl) => DWArr.includes(pl.name.toLowerCase()));
    let myNRPL = mynr.data.playlists.items[0].id
    return myNRPL
}

exports.searchMixPL = async (options) => {
    // LOOK FOR IT
    options.url = 'https://api.spotify.com/v1/me/playlists'
    const myPL = await axios(options);
    const myPLFound = myPL.data.items.find((pl) => pl.name === mix4SpotPlaylist.name)
    
    if(!myPLFound) {
        return false
    } else {
        return myPLFound.id
    }
}


exports.createMix = async (options) => {
    options.method = 'POST'
    options.url = `https://api.spotify.com/v1/users/`+userID+`/playlists`

    const data = {
      "name": mix4SpotPlaylist.name,
      "description": mix4SpotPlaylist.desc,
      "public": false
    }
    options.data = data

    const newPL = await axios(options);
}

exports.updateMix = async (options, id, uris) => {
    const respGetPL = await this.getPlaylistTracks(options, id)

    if(respGetPL.length > 0) {
        const tracksToRemove = respGetPL.map((t) => {
            return  {
                "uri": t.track.uri
            }
        })

        options.method = 'DELETE'
        options.data = {
            "tracks": tracksToRemove
        }
        options.url = `https://api.spotify.com/v1/playlists/`+id+`/tracks`
        const cleanPL = await axios(options)
    }

    options.method = 'POST'
    options.url = `https://api.spotify.com/v1/playlists/`+id+`/tracks` + uris
    const updatedPL = await axios(options)

    options.method = 'PUT'
    options.url = `https://api.spotify.com/v1/playlists/`+id 
    const data = {
        "name": mix4SpotPlaylist.name,
        "description": mix4SpotPlaylist.desc,
        "public": false
    }
    options.data = data 
    const metaUpdatedPL = await axios(options)
    
    return metaUpdatedPL
}
