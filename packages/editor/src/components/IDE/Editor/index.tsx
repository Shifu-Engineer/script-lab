import React, { Component } from 'react'
import { Layout } from './styles'
import ReactMonaco from './ReactMonaco'

import debounce from 'lodash/debounce'

import { connect } from 'react-redux'
import { actions, selectors } from '../../../store'
import {
  SETTINGS_SOLUTION_ID,
  EDIT_FILE_DEBOUNCE_MS,
  EDIT_SETTINGS_DEBOUNCE_MS,
} from 'src/constants'

interface IPropsFromRedux {
  backgroundColor: string

  activeSolution: ISolution
  activeFile: IFile
}

const mapStateToProps = state => ({
  backgroundColor: selectors.settings.getBackgroundColor(state),
})

interface IActionsFromRedux {
  editFile: (
    solutionId: string,
    fileId: string,
    file: Partial<IEditableFileProperties>,
  ) => void
  editSettings: (newSettings: string) => void
  signalEditorLoaded: () => void
}

const mapDispatchToProps = dispatch => ({
  editFile: (
    solutionId: string,
    fileId: string,
    file: Partial<IEditableFileProperties>,
  ) => dispatch(actions.solutions.edit({ id: solutionId, fileId, file })),
  editSettings: (newSettings: string) =>
    dispatch(actions.settings.editFile({ newSettings, showMessageBar: true })),
  signalEditorLoaded: (editor: any) => dispatch(actions.editor.onMount(editor)),
})

export interface IProps extends IPropsFromRedux, IActionsFromRedux {}

export class Editor extends Component<IProps> {
  editFile = debounce(
    (solutionId: string, fileId: string, content: string) =>
      this.props.editFile(solutionId, fileId, { content }),
    EDIT_FILE_DEBOUNCE_MS,
  )

  editSettings = debounce(
    (newSettings: string) => this.props.editSettings(newSettings),
    EDIT_SETTINGS_DEBOUNCE_MS,
  )

  onValueChange = (solutionId: string, fileId: string, content: string) =>
    solutionId === SETTINGS_SOLUTION_ID
      ? this.editSettings(content)
      : this.editFile(solutionId, fileId, content)

  render() {
    const { backgroundColor } = this.props

    return (
      <Layout style={{ backgroundColor }}>
        <ReactMonaco
          solutionId={this.props.activeSolution.id}
          file={this.props.activeFile}
          onValueChange={this.onValueChange}
          editorDidMount={this.props.signalEditorLoaded}
        />
      </Layout>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Editor)
