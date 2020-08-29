/* src/App.js */
import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { createRecipe } from './graphql/mutations'
import { listRecipes } from './graphql/queries'
import { withAuthenticator } from '@aws-amplify/ui-react'

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: '', description: '' }

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [recipes, setRecipes] = useState([])

  useEffect(() => {
    fetchRecipes()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchRecipes() {
    try {
      const recipeData = await API.graphql(graphqlOperation(listRecipes))
      const recipes = recipeData.data.listRecipes.items
      setRecipes(recipes)
    } catch (err) { console.log('error fetching recipes') }
  }

  async function addRecipe() {
    try {
      if (!formState.name || !formState.description) return
      const recipe = { ...formState }
      setRecipes([...recipes, recipe])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createRecipe, {input: recipe}))
    } catch (err) {
      console.log('error creating recipe:', err)
    }
  }

  return (
    <div style={styles.container}>
      <h2>Recipes</h2>
      <input
        onChange={event => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name} 
        placeholder="Name"
      />
      <input
        onChange={event => setInput('description', event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <button style={styles.button} onClick={addRecipe}>Create recipe</button>
      {
        recipes.map((recipe, index) => (
          <div key={recipe.id ? recipe.id : index} style={styles.recipe}>
            <p style={styles.todoName}>{recipe.name}</p>
            <p style={styles.todoDescription}>{recipe.description}</p>
          </div>
        ))
      }
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', padding: 20 },
  recipe: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default withAuthenticator(App)