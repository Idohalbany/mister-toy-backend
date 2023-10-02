import fs from 'fs'
import { utilService } from './util.service.js'

const toys = utilService.readJsonFile('data/toy.json')

export const toyService = {
  query,
  get,
  remove,
  save,
}

function query(filterBy = getDefaultFilter()) {
  let filteredToys = toys
  if (filterBy.name) {
    const regex = new RegExp(filterBy.name, 'i')
    filteredToys = filteredToys.filter((toy) => regex.test(toy.name))
  }

  if (filterBy.labels && filterBy.labels.length > 0) {
    filteredToys = filteredToys.filter((toy) => {
      return toy.labels && filterBy.labels.every((label) => toy.labels.includes(label))
    })
  }

  if (filterBy.inStock === 'true') {
    filteredToys = filteredToys.filter((toy) => toy.inStock)
  }

  if (filterBy.sortBy) {
    switch (filterBy.sortBy) {
      case 'name':
        filteredToys.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'price':
        filteredToys.sort((a, b) => a.price - b.price)
        break
      case 'createdAt':
        filteredToys.sort((a, b) => a.createdAt - b.createdAt)
        break
      default:
        break
    }
  }

  return Promise.resolve(filteredToys)
}

function get(toyId) {
  const toy = toys.find((toy) => toy._id === toyId)
  if (!toy) return Promise.reject('Toy not found!')
  return Promise.resolve(toy)
}

function remove(toyId) {
  const idx = toys.findIndex((toy) => toy._id === toyId)
  if (idx === -1) return Promise.reject('No Such Toy')
  // const toy = toys[idx]
  // if (toy.owner._id !== loggedinUser._id) return Promise.reject('Not your toy')
  toys.splice(idx, 1)
  return _saveToysToFile()
}

function save(toy) {

  if (toy._id) {
    const idx = toys.findIndex((currToy) => currToy._id === toy._id)
    if (idx !== -1) {
      toys[idx].name = toy.name
      toys[idx].price = toy.price
    }
  } else {
    toy._id = _makeId()
    toys.push(toy)
  }

  return _saveToysToFile().then(() => toy)
}

function _makeId(length = 5) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

function _saveToysToFile() {
  return new Promise((resolve, reject) => {
    const toysStr = JSON.stringify(toys, null, 4)
    fs.writeFile('data/toy.json', toysStr, (err) => {
      if (err) {
        return console.log(err)
      }
      resolve()
    })
  })
}
