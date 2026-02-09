// js/ui/render_form.js
//
// - Purpose:
//   Render the Add/Edit form view for a song
//
// - Responsibilities:
//   - Render input fields for song properties
//   - Support both "add" and "edit" modes
//   - Display validation messages per field (if provided)
//
// - Rules:
//   - No calls to storage_service, song_service, or stats_service
//   - No state mutation
//   - Rendering only
//
// - How it will be used:
//   app.js will:
//   - pass in mode ('add' or 'edit')
//   - pass in initial_values (existing song when editing)
//   - pass in validation_errors (returned from the model/service)

import { create_element } from './dom.js';


// - Function: render_field_error
// - Purpose:
//   Render a small error message under a field if present
function render_field_error(message) {
  if (!message) return null;
  return create_element('div', { class: 'field_error' }, [message]);
}


// - Function: render_text_input
// - Purpose:
//   Render a labeled text input with optional error message
function render_text_input({ label, name, value, placeholder, error_message }) {
  return create_element('div', { class: 'form_field' }, [
    create_element('label', { for: name, class: 'field_label' }, [label]),
    create_element('input', {
      type: 'text',
      name,
      id: name,
      value: value || '',
      placeholder: placeholder || ''
    }),
    render_field_error(error_message)
  ]);
}


// - Function: render_number_input
// - Purpose:
//   Render a labeled number input with optional error message
function render_number_input({ label, name, value, placeholder, min, max, error_message }) {
  return create_element('div', { class: 'form_field' }, [
    create_element('label', { for: name, class: 'field_label' }, [label]),
    create_element('input', {
      type: 'number',
      name,
      id: name,
      value: value ?? '',
      placeholder: placeholder || '',
      min: min ?? undefined,
      max: max ?? undefined
    }),
    render_field_error(error_message)
  ]);
}


// - Function: render_form_view
// - Purpose:
//   Render the complete form view
//
// - Parameters:
//   mode              -> 'add' | 'edit'
//   initial_values    -> object with fields for prefill
//   validation_errors -> object keyed by field name
//
// - Returns:
//   DOM element for the form view
export function render_form_view({ mode, initial_values, validation_errors }) {
  const safe_values = initial_values || {};
  const errors = validation_errors || {};

  const title_text = mode === 'edit' ? 'edit song' : 'add song';
  const submit_text = mode === 'edit' ? 'save changes' : 'add song';

  return create_element('div', { class: 'form_view' }, [
    create_element('h2', {}, [title_text]),

    // - The form uses data-form so app.js can find it easily
    // - The hidden song_id field is included for edit mode
    create_element('form', { dataset: { form: 'song' } }, [
      create_element('input', {
        type: 'hidden',
        name: 'song_id',
        value: safe_values.id || ''
      }),

      render_text_input({
        label: 'title (required)',
        name: 'title',
        value: safe_values.title,
        placeholder: 'ex: good times bad times',
        error_message: errors.title
      }),

      render_text_input({
        label: 'artist (required)',
        name: 'artist',
        value: safe_values.artist,
        placeholder: 'ex: led zeppelin',
        error_message: errors.artist
      }),

      render_text_input({
        label: 'album',
        name: 'album',
        value: safe_values.album,
        placeholder: 'ex: houses of the holy',
        error_message: errors.album
      }),

      render_text_input({
        label: 'playlist',
        name: 'playlist',
        value: safe_values.playlist,
        placeholder: 'ex: driving',
        error_message: errors.playlist
      }),

      render_text_input({
        label: 'genre',
        name: 'genre',
        value: safe_values.genre,
        placeholder: 'ex: blues',
        error_message: errors.genre
      }),

      render_number_input({
        label: 'duration_seconds (required)',
        name: 'duration_seconds',
        value: safe_values.duration_seconds,
        placeholder: 'ex: 210',
        min: 1,
        max: 3600,
        error_message: errors.duration_seconds
      }),

      render_number_input({
        label: 'rating (1 to 5)',
        name: 'rating',
        value: safe_values.rating,
        placeholder: 'ex: 5',
        min: 1,
        max: 5,
        error_message: errors.rating
      }),

      create_element('div', { class: 'form_actions' }, [
        create_element(
          'button',
          { type: 'submit', class: 'primary_button', dataset: { action: 'submit_song_form' } },
          [submit_text]
        ),
        create_element(
          'button',
          { type: 'button', class: 'secondary_button', dataset: { view: 'list' } },
          ['cancel']
        )
      ])
    ])
  ]);
}