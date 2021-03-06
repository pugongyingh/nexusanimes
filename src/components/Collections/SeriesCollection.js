import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getMediaForCollection } from '../../actions'
import { push } from 'connected-react-router'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Collection from './Collection'
import { Button, ButtonGroup } from 'reactstrap'

class SeriesCollection extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loaded: false,
      expanded: false,
      order: 'old'
    }
    this.load = this.load.bind(this)
    this.toggleExpanded = this.toggleExpanded.bind(this)
  }

  async componentDidMount () {
    const { loaded } = this.state
    const { defaultLoaded, hash } = this.props
    if (defaultLoaded && !loaded) {
      await this.load()
      if (hash) {
        // scroll to the hash
        setTimeout(() => document.getElementById(hash).scrollIntoView({ behavior: 'smooth' }), 0)
      }
      this.setState({ expanded: true })
    }
  }

  async load () {
    const { dispatch, id } = this.props
    await dispatch(getMediaForCollection(id))
    this.setState({ loaded: true })
  }

  async toggleExpanded () {
    const { loaded, expanded } = this.state
    const { dispatch, id } = this.props
    this.setState({ expanded: !expanded })
    // load if not loaded
    if (!loaded) {
      await this.load()
    }
    // set the hash if not expanded yet
    if (!expanded) {
      dispatch(push(`#collection_${id}`))
    }
  }

  render () {
    const { loaded, expanded, order } = this.state
    const { title, collectionMedia, id, orderControls, perPage = 3, defaultLoaded } = this.props
    return (
      <div className='mt-4'>
        <h4 className='border-bottom pb-3' style={{ cursor: 'pointer', userSelect: 'none' }} onClick={this.toggleExpanded}>
          {/* eslint-disable-next-line */}
          <a id={`#collection_${id}`} className='d-flex justify-content-between'>
            {title}
            <FontAwesomeIcon icon={expanded ? 'caret-down' : 'caret-left'} className='align-self-center ml-1' />
          </a>
        </h4>
        {
          expanded
            ? (
              <Fragment>
                {orderControls
                  ? (
                    <div className='d-flex w-100 justify-content-end'>
                      <ButtonGroup size='sm' id='order'>
                        <Button active={order === 'new'} onClick={() => this.setState({ order: 'new' })}>Newest</Button>
                        <Button active={order === 'old'} onClick={() => this.setState({ order: 'old' })}>Oldest</Button>
                      </ButtonGroup>
                    </div>
                  )
                  : null}

                <div className='mb-4' />

                <Collection
                  mediaIds={loaded && collectionMedia[id] ? collectionMedia[id] : []}
                  order={order}
                  loading={!loaded && !collectionMedia[id]}
                  perPage={perPage}
                  showTitle={false} />
              </Fragment>
            )
            : !loaded && defaultLoaded ? (
                <Collection
                  loading={true}
                  perPage={perPage}
                  showTitle={false} />
              ) : null
        }
      </div>
    )
  }
}

export default connect((store) => {
  return {
    collectionMedia: store.Data.collectionMedia,

    orderControls: store.Options.orderControls,

    hash: store.router.location.hash
  }
})(SeriesCollection)
