import { DeleteIcon, EditIcon } from "@chakra-ui/icons"
import { Box, IconButton } from "@chakra-ui/react"
import { useDeletePostMutation, useMeQuery } from "../generated/graphql"
import NextLink from 'next/link'
import router from "next/router"
interface EditDeleteButton{
    postId:string,
    postUserId:string
}

export const PostEditDeleteButton = ({postUserId,postId}:EditDeleteButton) => {
    const {data}=useMeQuery()
    const [deletepost,_]=useDeletePostMutation()

    const ondeletePost=async()=>{
       const check= confirm("bạn có muốn xóa bài viết này");
       if(check)
       {
         await deletepost({
             variables:{
                    id:postId,
                },
            update(cache,{data}){
                if(data?.deletePost.success){
                    cache.modify({
						fields: {
							posts(existing) {
								const newPostsAfterDeletion = {
									...existing,
									totalCount: existing.totalCount - 1,
									paginatedPosts: existing.paginatedPosts.filter(
										(postRefObject:any) => postRefObject.__ref !== `Post:${postId}`
									)
								}
								return newPostsAfterDeletion
							}
						}
					})
                }
            }
        })
        alert('deleted')
       }
    }
    return (<>
        {data?.me?.id==postUserId&&
        (<Box>
            <NextLink href={`/post/edit/${postId}`}>
            <IconButton icon={<EditIcon/>} arial-label='edit' mr={4}/>
            </NextLink>

            <IconButton icon={<DeleteIcon/>} arial-label='delete' colorScheme='red' onClick={ondeletePost}/>
        </Box>)}
    </>)
}
