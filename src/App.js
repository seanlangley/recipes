/* src/App.js */
import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { createRecipe } from './graphql/mutations'
import { listRecipes } from './graphql/queries'
import { withAuthenticator } from '@aws-amplify/ui-react'

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: '', instructions: '' }

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [recipes, setRecipes] = useState([])
  const [numInstrs, setNumInstrs] = useState(3);

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
      if (!formState.name || !formState.instructions) return
      let recipe = { ...formState }
      recipe.instructions = recipe.instructions.split('\n')
      setRecipes([...recipes, recipe])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createRecipe, {input: recipe}))
    } catch (err) {
      console.log('error creating recipe:', err)
    }
  }

  function InstructionList(props) {
    let instrs = [];
    for (let i = 0; i < props.num_items; i++) {
      instrs.push(<input key={i} placeholder={"Step " + i} />);
    }
    return instrs;
  }

  return (
    <div style={styles.container}>
      <h2>Recipes</h2>
      <button onClick={() => {console.log("hi"); setNumInstrs(numInstrs+1);}}>test</button>
      <InstructionList num_items={numInstrs}/>
      <input
        onChange={event => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name} 
        placeholder="Name"
      />
      <textarea
        onChange={event => setInput('instructions', event.target.value)}
        style={styles.input}
        value={formState.instructions}
        placeholder="Instructions"
      />
      <button style={styles.button} onClick={addRecipe}>Create recipe</button>
      {
        recipes.map((recipe, index) => (
          <div key={recipe.id ? recipe.id : index} style={styles.recipe}>
            <p style={styles.todoName}>{recipe.name}</p>
            { recipe.instructions ? 
                recipe.instructions.map((instruction, index) => (
                    <p key={index} style={styles.todoDescription}>{instruction}</p>
                ))
                : <p>No Instructions</p>
            }
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