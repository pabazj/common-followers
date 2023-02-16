import React, { useState, useEffect, useCallback } from 'react';
import {
    styled,
    Avatar,
    Backdrop,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    TextField,
    Typography,
    CircularProgress,
    IconButton
} from '@mui/material';
import ClearIcon from "@mui/icons-material/ClearOutlined";
import { Octokit } from "@octokit/rest";
import debounce from 'lodash.debounce';
const octokit = new Octokit();

const MainBox = styled(Box)({
    display: 'flex',
    alignTtems: 'center',
    justifyContent: 'center',
})

const InputContainer = styled(Box)({
    paddingTop: '2rem'
})

const MessageContainer = styled('div')({
    display: 'flex',
    alignTtems: 'center',
    justifyContent: 'center',
    padding: '2rem 0',
    color: 'red'
})

const ResultContainer = styled('div')({
    display: 'flex',
    alignTtems: 'center',
    justifyContent: 'center',
    padding: '2rem 0'
})


function CommonFollowers() {
    const [userOne, setUserOne] = useState('');
    const [userTwo, setUserTwo] = useState('');
    const [commonFollowers, setCommonFollowers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setError('')
        if (userOne && userTwo) {
            getCommonFollowers();
        }
    }, [userOne, userTwo]);

    const getAllFollowers = async (username) => {
        try {
            const allFollowers = await octokit.paginate("GET /users/:username/followers", {
                username,
                per_page: 100,
            });
            return allFollowers.map((follower) => follower);
        } catch (error) {
            setError('User not found')
        }
    };

    const getCommonFollowers = async () => {
        setLoading(true)
        try {
            const [userOneFollowers, userTwoFollowers] = await Promise.all([
                getAllFollowers(userOne),
                getAllFollowers(userTwo)
            ]);

            const commonFollowersList = userOneFollowers?.filter((userOne) => {
                return userTwoFollowers?.some((userTwo) => {
                    return userOne.login === userTwo.login;
                });
            })
           
            setCommonFollowers(commonFollowersList);
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.error(error);
        }
    }

    const changeHandler = (e) => {
        setUserTwo(e.target.value)
    }

    const debouncedChangeHandler = useCallback(
        debounce(changeHandler, 1000)
        , []);

    return (
        <MainBox>
            <div>
                <Typography variant="h3">
                    Common Followers Finder
                </Typography>
                <InputContainer
                    sx={{
                        display: { xs: 'block', sm: 'flex', md: 'flex', lg: 'flex' },
                        justifyContent: { xs: 'none', sm: 'space-between', md: 'space-between', lg: 'space-between' },
                        alignItems: { xs: 'none', sm: 'center', md: 'center', lg: 'center' },
                    }}
                >
                    <TextField
                        helperText="Please enter first user"
                        id="first-user"
                        label="First User"
                        onChange={(e) => setUserOne(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <IconButton
                                    edge="end">
                                    <ClearIcon />
                                </IconButton>
                            )
                        }}
                    />
                    <TextField
                        helperText="Please enter second user"
                        id="second-user"
                        label="Second User"
                        onChange={debouncedChangeHandler}
                        InputProps={{
                            endAdornment: (
                              <IconButton 
                                edge="end">
                                <ClearIcon />
                              </IconButton>
                            )
                          }}
                    />
                </InputContainer>

                {loading &&
                    <Backdrop
                        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                        open={loading}
                    >
                        <CircularProgress color="inherit" />
                    </Backdrop>
                }
                {error &&
                    <MessageContainer>{error}</MessageContainer>
                }
                {userOne !== '' && userTwo !== '' && !loading && !error && commonFollowers.length === 0 && <MessageContainer>No common followers found</MessageContainer>}

                {commonFollowers.length > 0 && (
                    <ResultContainer>
                        <List >
                            {commonFollowers.map((follower) => (
                                    <ListItem key={follower.login}>
                                        <ListItemAvatar>
                                            <Avatar alt="" src={follower.avatar_url} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={follower.login}
                                        />
                                    </ListItem>  
                            ))}
                        </List>
                    </ResultContainer>
                )}
            </div>
        </MainBox>
    )
}

export default CommonFollowers
