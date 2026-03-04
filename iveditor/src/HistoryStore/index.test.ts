import { expect, test } from 'vitest'
import HistoryStore from './index'
import { model, Model, modelAction, tProp, types } from 'mobx-keystone'

@model("test/Counter")
class Counter extends Model({
  count: tProp(types.number, 0)
}) {
  @modelAction
  increment() {
    this.count++
  }

  @modelAction
  set(v: number) {
    this.count = v
  }
}

test("case 1", async () => {
  let counter = new Counter({})
  let history = new HistoryStore(counter)

  counter.increment()
  expect(counter.count).toBe(1)
  
  await time(300)
  history.undo()
  expect(counter.count).toBe(0)
})

test("case 2", async () => {
  let counter = new Counter({})
  let history = new HistoryStore(counter)

  counter.increment()
  expect(counter.count).toBe(1)

  await time(300)
  history.undo()
  expect(counter.count).toBe(0)

  history.redo()
  expect(counter.count).toBe(1)
})


test("case 3", async () => {
  let counter = new Counter({})
  let history = new HistoryStore(counter)

  counter.increment()
  expect(counter.count).toBe(1)
  
  await time(300)
  history.undo()
  expect(counter.count).toBe(0)
  
  counter.set(10)
  expect(counter.count).toBe(10)

  await time(300) // this shouldn't be required
  history.redo()
  expect(counter.count).toBe(10)
})


test("case 4", async () => {
  let counter = new Counter({})
  let history = new HistoryStore(counter)

  counter.increment()
  expect(counter.count).toBe(1)
  
  await time(300)
  history.undo()
  expect(counter.count).toBe(0)
  
  counter.set(10)
  await time(300)
  history.undo()
  expect(counter.count).toBe(0)
})

test("case 5", async () => {
  let counter = new Counter({})
  let history = new HistoryStore(counter)

  counter.set(1)
  counter.set(2)
  counter.set(3)
  await time(300)
  history.undo()
  counter.set(4)
  await time(300)
  history.undo()

  expect(counter.count).toBe(0)
})

test("case 6", async () => {
  let counter = new Counter({})
  let history = new HistoryStore(counter)

  counter.set(1)
  await time(100)
  counter.set(2)

  await time(300)
  history.undo()

  expect(counter.count).toBe(0)
}) 


test("case 7", async () => {
  let counter = new Counter({})
  let history = new HistoryStore(counter)

  counter.set(1)
  await time(100)
  counter.set(2)

  await time(300)
  counter.set(3)

  await time(300)
  history.undo()
  expect(counter.count).toBe(2)

  history.undo()
  expect(counter.count).toBe(0)
}) 


test("case 7", async () => {
  let counter = new Counter({})
  let history = new HistoryStore(counter)

  counter.set(1)
  await time(100)
  counter.set(2)

  await time(300)
  counter.set(3)

  await time(300)
  counter.set(4)

  await time(300)
  history.undo()
  expect(counter.count).toBe(3)

  history.undo()
  expect(counter.count).toBe(2)
}) 


test("case 8", async () => {
  let counter = new Counter({})
  let history = new HistoryStore(counter)

  counter.set(1)
  await time(100)
  counter.set(2)

  await time(300)
  counter.set(3)

  await time(300)
  counter.set(4)

  await time(300)
  history.undo()
  expect(counter.count).toBe(3)

  history.undo()
  expect(counter.count).toBe(2)

  history.redo()
  expect(counter.count).toBe(3)

  history.redo()
  expect(counter.count).toBe(4)
}) 

test.skip("case 9", async () => {
  let counter = new Counter({})
  let history = new HistoryStore(counter)

  for (let i of Array.from({ length: 60 })) {
    counter.set(counter.count + 1)
    await time(300)
  }

  expect(counter.count).toBe(60)

  history.undo()
  expect(counter.count).toBe(59)

}, 300 * 60 + 5000)

const time = (t: number) => new Promise(r => setTimeout(r, t))