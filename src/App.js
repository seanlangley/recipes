/* src/App.js */
import React, { useEffect, useState } from "react";
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { createRecipe } from "./graphql/mutations";
import { listRecipes } from "./graphql/queries";
import { withAuthenticator } from "@aws-amplify/ui-react";

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: "", instructions: [] };

const App = () => {
  const [formState, setFormState] = useState(initialState);
  const [recipes, setRecipes] = useState([]);
  const [numInstrs, setNumInstrs] = useState(0);
  const [inputs, setInputs] = useState([]);

  useEffect(() => {
    fetchRecipes();
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchRecipes() {
    try {
      const recipeData = await API.graphql(graphqlOperation(listRecipes));
      const recipes = recipeData.data.listRecipes.items;
      setRecipes(recipes);
    } catch (err) {
      console.log("error fetching recipes");
    }
  }

  async function addRecipe() {
    try {
      if (!formState.name || !formState.instructions) return;
      let recipe = { ...formState };
      setRecipes([...recipes, recipe]);
      setFormState(initialState);
      await API.graphql(graphqlOperation(createRecipe, { input: recipe }));
    } catch (err) {
      console.log("error creating recipe:", err);
    }
  }

  function InstrInput(props){
    let list_idx = props.idx+1;
    return (
        <input
          placeholder={"Step " + list_idx}
          value={formState.instructions[props.idx]}
          onChange={(event) => {
            let instrs_copy = formState.instructions;
            instrs_copy[props.idx] = event.target.value;
            setInput("instructions", instrs_copy)
            console.log(formState.instructions);
          }}
        />
    );
  }

  return (
    <div style={styles.container}>
      <h2>Recipes</h2>
      <input
        onChange={(event) => setInput("name", event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <button
        onClick={() => {
          setInputs([...inputs,
            <InstrInput key={numInstrs} idx={numInstrs}/>
          ]);
          console.log(numInstrs)
          setNumInstrs(numInstrs + 1);
        }}
      >Add some steps</button>
      {inputs}
      <hr></hr>
      <button style={styles.button} onClick={addRecipe}>
        Create recipe
      </button>
      {recipes.map((recipe, index) => (
        <div key={recipe.id ? recipe.id : index} style={styles.recipe}>
          <p style={styles.todoName}>{recipe.name}</p>
          {recipe.instructions ? (
            recipe.instructions.map((instruction, index) => (
              <p key={index} style={styles.todoDescription}>
                {index+1}. {instruction}
              </p>
            ))
          ) : (
            <p>No Instructions</p>
          )}
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    width: 400,
    margin: "0 auto",
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    padding: 20,
  },
  recipe: { marginBottom: 15 },
  input: {
    border: "none",
    backgroundColor: "#ddd",
    marginBottom: 10,
    padding: 8,
    fontSize: 18,
  },
  todoName: { fontSize: 20, fontWeight: "bold" },
  todoDescription: { marginBottom: 0 },
  button: {
    backgroundColor: "black",
    color: "white",
    outline: "none",
    fontSize: 18,
    padding: "12px 0px",
  },
};

export default withAuthenticator(App);
